param(
    [ValidateSet('start','stop','restart','status','build')]
    [string]$Action = 'start'
)

# Config
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$logDir = Join-Path $scriptRoot 'logs'
New-Item -Path $logDir -ItemType Directory -Force | Out-Null

$services = @(
    @{ name='backend'; cwd=Join-Path $scriptRoot '..\backend'; command='npm run dev'; ports=@(3000); log='backend.log' },
    @{ name='frontend'; cwd=Join-Path $scriptRoot '..'; command='ng serve buildaq-schools'; ports=@(4201); log='frontend.log' },
    # Optional host shell that loads microfrontends (buildaq-shell). If the folder isn't present this service will be skipped.
    # The shell path may be located at ../buildaq-shell (monorepo) or at C:\DEV\buildaq-shell (separate checkout).
    @{ name='shell'; cwd='__SHELL_PATH__'; command='npm run start:local'; ports=@(4200); log='shell.log' },
    @{ name='schools-api-dotnet'; cwd=Join-Path $scriptRoot '..\schools-api-dotnet\BuildAQ.SchoolsApi'; command='dotnet run --no-launch-profile'; ports=@(5000,5137,7081); log='schools-api-dotnet.log' }
)

# Configure allowed origins for local development. You can override by setting the
# environment variable DEV_ALLOWED_ORIGINS (comma-separated) before running this script.
$corsList = $env:DEV_ALLOWED_ORIGINS
if (-not $corsList -or $corsList -eq '') {
    $corsList = 'http://localhost:4201,http://localhost:4200'
}

function Kill-Listeners([int[]]$ports) {
    $allPids = @()
    foreach ($p in $ports) {
        try {
            $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
            if ($conns) { $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique; $allPids += $pids }
        } catch { }
    }
    $allPids = $allPids | Where-Object { $_ -and $_ -ne $PID } | Select-Object -Unique
    foreach ($pidToKill in $allPids) {
        try { Stop-Process -Id $pidToKill -Force -ErrorAction Stop; Write-Host "Stopped PID $pidToKill" } catch { Write-Host "taskkill for PID $pidToKill"; cmd /c "taskkill /PID $pidToKill /F" | Out-Null }
    }
    return $allPids
}

# Resolve buildaq-shell path: prefer environment override, then repo-local, then global C:\DEV location
$shellEnv = $env:SHELL_PATH
$repoShell = Join-Path $scriptRoot '..\buildaq-shell'
$globalShell = 'C:\DEV\buildaq-shell'
$resolvedShell = $null
if ($shellEnv -and (Test-Path $shellEnv)) {
    $resolvedShell = $shellEnv
} elseif (Test-Path $repoShell) {
    $resolvedShell = $repoShell
} elseif (Test-Path $globalShell) {
    $resolvedShell = $globalShell
} else {
    # fallback to repoShell (may not exist) so script placeholder is consistent
    $resolvedShell = $repoShell
}

# Replace placeholder in services array with actual resolved path
for ($i = 0; $i -lt $services.Count; $i++) {
    if ($services[$i].name -eq 'shell') { $services[$i].cwd = $resolvedShell }
}

# If shell package.json doesn't include start:local, fallback to `npm start`
$shellPkg = Join-Path $resolvedShell 'package.json'
if (Test-Path $shellPkg) {
    try {
        $pkgJson = Get-Content $shellPkg -Raw | ConvertFrom-Json
        if (-not ($pkgJson.scripts -and $pkgJson.scripts.'start:local')) {
            for ($i = 0; $i -lt $services.Count; $i++) {
                if ($services[$i].name -eq 'shell') { $services[$i].command = 'npm start' }
            }
            Write-Host 'Note: start:local not found in buildaq-shell package.json — falling back to npm start'
        }
    } catch {
        Write-Host 'Warning: unable to inspect buildaq-shell package.json'
    }
}

function Start-ServiceWindow($svc) {
    $cwd = $svc.cwd
    $command = $svc.command
    $log = Join-Path $logDir $svc.log
    $escapedPath = $cwd -replace "'", "''"

    if ($svc.name -in @('backend','schools-api-dotnet','shell')) {

        $escapedCors = $corsList -replace "'", "''"
        $wrapper = @"
Set-Location -LiteralPath '$escapedPath'
`$env:CORS_ORIGIN = '$escapedCors'
`$env:ALLOWED_ORIGINS = '$escapedCors'
Write-Host 'Starting: $($svc.name) > $log'
& $command 2>&1 | Tee-Object -FilePath '$log'
"@

        $wrapperDir = Join-Path $scriptRoot 'wrappers'
        New-Item -Path $wrapperDir -ItemType Directory -Force | Out-Null
        $tmpFile = Join-Path $wrapperDir "start-$($svc.name).ps1"
        $wrapper | Set-Content -LiteralPath $tmpFile -Force -Encoding UTF8

        $args = @('-NoExit','-File',$tmpFile)
        Start-Process -FilePath 'powershell.exe' -ArgumentList $args -WorkingDirectory $cwd -WindowStyle Normal | Out-Null
        Write-Host "Launched $($svc.name) (logs -> $log) (wrapper -> $tmpFile)"
        } else {
            $cmd = "Set-Location -LiteralPath '$escapedPath'; Write-Host 'Starting: $($svc.name) > $log'; & $command 2>&1 | Tee-Object -FilePath '$log'"
            $args = @('-NoExit','-Command',$cmd)
            Start-Process -FilePath 'powershell.exe' -ArgumentList $args -WorkingDirectory $cwd -WindowStyle Normal | Out-Null
            Write-Host "Launched $($svc.name) (logs -> $log)"
    }
}

function Wait-For-Url($url, $timeoutSec = 60) {
    $deadline = (Get-Date).AddSeconds($timeoutSec)
    while ((Get-Date) -lt $deadline) {
        try {
            $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            return $true
        } catch { Start-Sleep -Seconds 1 }
    }
    return $false
}

function Start-All {
    # Stop any running dev services first (safe to call even if none running)
    Write-Host 'Stopping any running dev services before build/start'
    Stop-All

    # Run builds (frontend and dotnet). Fail fast if build fails.
    try {
        Write-Host 'Building frontend (npm run build) -- this may take a moment'
        Push-Location (Join-Path $scriptRoot '..')
        $npmExit = & npm run build
        Pop-Location
        Write-Host 'Frontend build finished.'
    } catch {
        Write-Host 'Frontend build failed:' $_.Exception.Message
        return
    }

    try {
        Write-Host 'Building .NET API (dotnet build)'
        Push-Location (Join-Path $scriptRoot '..\schools-api-dotnet\BuildAQ.SchoolsApi')
        dotnet build
        Pop-Location
        Write-Host '.NET API build finished.'
    } catch {
        Write-Host '.NET API build failed:' $_.Exception.Message
        return
    }

    # Export CORS env vars for child processes so backend picks them up reliably
    Write-Host "Exporting CORS env vars for child processes: $corsList"
    $env:CORS_ORIGIN = $corsList
    $env:ALLOWED_ORIGINS = $corsList

    # Kill processes listening on dev ports (cleanup) and start fresh
    $ports = $services | ForEach-Object { $_.ports } | ForEach-Object { $_ } | Sort-Object -Unique
    if ($ports) { Write-Host "Killing listeners on ports: $($ports -join ', ')"; Kill-Listeners -ports $ports }

    foreach ($svc in $services) {
        if (-not (Test-Path $svc.cwd)) {
            Write-Host "Skipping $($svc.name) - directory not found: $($svc.cwd)"
            continue
        }
        Start-ServiceWindow $svc; Start-Sleep -Milliseconds 500
    }

    # Wait for health
    if (Wait-For-Url 'http://localhost:3000/api/health' 30) { Write-Host 'Backend is up' } else { Write-Host 'Backend not responding yet' }
    if (Wait-For-Url 'http://localhost:5137/api/BuildInfo' 30) { Write-Host '.NET API up at 5137' } elseif (Wait-For-Url 'http://localhost:5000/api/BuildInfo' 30) { Write-Host '.NET API up at 5000' } else { Write-Host '.NET API not responding yet' }
    if (Wait-For-Url 'http://localhost:4201/' 60) { Write-Host 'Frontend is up' } else { Write-Host 'Frontend not responding yet' }

    # Special-case: some Angular federation shells require a second `npm start` to generate federation artefacts.
    # If shell isn't listening on port 4200 after the initial start, attempt a single restart.
    $shellConn = Get-NetTCPConnection -LocalPort 4200 -ErrorAction SilentlyContinue
    if (-not $shellConn) {
        Write-Host 'Shell not responding on port 4200 — attempting one restart to generate federation artefacts'
        $shellSvc = $services | Where-Object { $_.name -eq 'shell' }
        if ($shellSvc -and (Test-Path $shellSvc.cwd)) {
            # Kill any listeners on the shell port to ensure clean start
            Kill-Listeners -ports @(@(4200)) | Out-Null
            Start-ServiceWindow $shellSvc
            Start-Sleep -Seconds 6
            if (Wait-For-Url 'http://localhost:4200/' 30) { Write-Host 'Shell is now up at 4200' } else { Write-Host 'Shell still not responding after restart attempt' }
        } else {
            Write-Host 'Shell service not configured or directory missing; cannot attempt restart.'
        }
    }
}

function Stop-All {
    $ports = $services | ForEach-Object { $_.ports } | ForEach-Object { $_ } | Sort-Object -Unique
    if ($ports) { Write-Host "Stopping processes on ports: $($ports -join ', ')"; $pids = Kill-Listeners -ports $ports; if (-not $pids) { Write-Host 'No processes found to stop' } }
}

function Status-All {
    foreach ($svc in $services) {
        foreach ($p in $svc.ports) {
            $conn = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
            if ($conn) { Write-Host "$($svc.name) -> port $p : LISTENING (PID: $($conn.OwningProcess -join ','))" } else { Write-Host "$($svc.name) -> port $p : not listening" }
        }
    }
}

switch ($Action) {
    'start' { Start-All }
    'stop' { Stop-All }
    'restart' { Stop-All; Start-Sleep -Seconds 1; Start-All }
    'status' { Status-All }
    'build' {
        Write-Host 'Building frontend and dotnet project...'
        Push-Location (Join-Path $scriptRoot '..'); npm run build; Pop-Location
        Push-Location (Join-Path $scriptRoot '..\schools-api-dotnet\BuildAQ.SchoolsApi'); dotnet build; Pop-Location
    }
}

Write-Host "Script finished. Logs are in: $logDir"
