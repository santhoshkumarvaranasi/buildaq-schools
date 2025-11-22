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

# Optionally use the lightweight static MF server (serves built dist) instead of the Angular dev server.
# Set the environment variable `USE_MF_STATIC=true` before running this script to enable.
# Note: the static server serves files from `dist/buildaq-schools/browser` so run `npm run build`
# in the repo root before enabling this option.
if ($env:USE_MF_STATIC -and $env:USE_MF_STATIC.ToString().ToLower() -eq 'true') {
    Write-Host 'USE_MF_STATIC=true -> configuring mf build-watch + BrowserSync (live reload for dist)'
    # Replace the single frontend service entry with two services:
    #  - mf-build-watch: runs an ng build in watch mode and writes to dist
    #  - mf-browsersync: serves the dist folder with BrowserSync on port 4201
    for ($i = 0; $i -lt $services.Count; $i++) {
        if ($services[$i].name -eq 'frontend') {
            # remove the frontend service and insert two entries in its place
            $before = $services[0..($i-1)]
            $after = $services[($i+1)..($services.Count-1)]


            # Prefer the npm script `start:mf-watch` which encapsulates build-watch + BrowserSync.
            # If the script is not defined in package.json, fall back to an npx concurrently command.
            $pkgPath = Join-Path $scriptRoot '..\package.json'
            $mfCommand = 'npm run start:mf-watch'
            if (Test-Path $pkgPath) {
                try {
                    $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
                    if (-not ($pkg.scripts -and $pkg.scripts.'start:mf-watch')) {
                        $ngWatch = 'npx ng build --watch --configuration development --output-path=dist/buildaq-schools/browser'
                        $bsCmd = 'npx browser-sync start --server "dist/buildaq-schools/browser" --files "dist/buildaq-schools/browser/**/*" --no-ui --no-notify --port 4201 --cors'
                        $mfCommand = "npx concurrently `"$ngWatch`" `"$bsCmd`""
                    }
                    } catch {
                        $ngWatch = 'npx ng build --watch --configuration development --output-path=dist/buildaq-schools/browser'
                        $bsCmd = 'npx browser-sync start --server "dist/buildaq-schools/browser" --files "dist/buildaq-schools/browser/**/*" --no-ui --no-notify --port 4201 --cors'
                        $mfCommand = "npx concurrently `"$ngWatch`" `"$bsCmd`""
                }
            } else {
                $ngWatch = 'npx ng build --watch --configuration development --output-path=dist/buildaq-schools/browser'
                $bsCmd = 'npx browser-sync start --server "dist/buildaq-schools/browser" --files "dist/buildaq-schools/browser/**/*" --no-ui --no-notify --port 4201'
                $mfCommand = "npx concurrently `"$ngWatch`" `"$bsCmd`""
            }

            $mfWatch = @{ name='mf-watch'; cwd=Join-Path $scriptRoot '..'; command=$mfCommand; ports=@(4201); log='mf-watch.log' }

            $new = @()
            if ($before) { $new += $before }
            $new += $mfWatch
            if ($after) { $new += $after }

            # Reassign services to the new array
            $services = $new
            break
        }
    }
}

# Configure allowed origins for local development. You can override by setting the
# environment variable DEV_ALLOWED_ORIGINS (comma-separated) before running this script.
$corsList = $env:DEV_ALLOWED_ORIGINS
if (-not $corsList -or $corsList -eq '') {
    $corsList = 'http://localhost:4201,http://localhost:4200'
}

# Resolve buildaq-shell path for `shell` service. Preference order:
# 1) env var `SHELL_PATH` (or `BUILDQ_SHELL_PATH`), 2) repo relative ../buildaq-shell, 3) global C:\DEV\buildaq-shell
$shellEnv = $env:SHELL_PATH
if (-not $shellEnv) { $shellEnv = $env:BUILDQ_SHELL_PATH }
$repoShell = Join-Path $scriptRoot '..\buildaq-shell'
$globalShell = 'C:\DEV\buildaq-shell'
$resolvedShell = $null
if ($shellEnv -and (Test-Path $shellEnv)) {
    $resolvedShell = $shellEnv
    Write-Host "Using shell from SHELL_PATH: $resolvedShell"
} elseif (Test-Path $repoShell) {
    $resolvedShell = $repoShell
    Write-Host "Using shell from repo: $resolvedShell"
} elseif (Test-Path $globalShell) {
    $resolvedShell = $globalShell
    Write-Host "Using shell from global path: $resolvedShell"
} else {
    # Fallback to repo location (may not exist) so placeholder is consistent
    $resolvedShell = $repoShell
    Write-Host "Shell path not found; defaulting to $resolvedShell (may not exist)"
}

# Replace placeholder in services array with resolved path for shell service
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

# By default preserve already-running Angular dev servers (frontend/shell).
# Set environment variable `PRESERVE_ANGULAR_SERVERS` to `false` to force killing them.
$preserveAngular = $env:PRESERVE_ANGULAR_SERVERS
if (-not $preserveAngular -or $preserveAngular -eq '') { $preserveAngular = 'true' }
$preserveAngular = $preserveAngular.ToString().ToLower() -eq 'true'

function Is-AngularProcess([int]$pid) {
    try {
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $pid" -ErrorAction Stop
        if (-not $proc) { return $false }
        $cmd = $proc.CommandLine -as [string]
        if (-not $cmd) { $cmd = '' } else { $cmd = $cmd.ToLower() }
        if ($cmd -match '(^|\\b)ng(\.cmd)?(\b| )' -or $cmd -match 'ng serve' -or $cmd -match 'webpack' -or $cmd -match 'webpack-dev-server') {
            return $true
        }
        # Sometimes Angular runs via node with a script path including "@angular" or "@nrwl"/"nx"
        if ($cmd -match '@angular' -or $cmd -match '@nrwl' -or $cmd -match 'nx serve') { return $true }
    } catch {
        return $false
    }
    return $false
}

function Kill-Listeners([int[]]$ports) {
    $allPids = @()
    $preservedPids = @()
    foreach ($p in $ports) {
        try {
            $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
            if ($conns) {
                $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
                foreach ($pid in $pids) {
                    if ($preserveAngular) {
                        if (Is-AngularProcess -pid $pid) {
                            $preservedPids += @{ Port = $p; Pid = $pid }
                            continue
                        }
                    }
                    $allPids += $pid
                }
            }
        } catch {
            $msg = $_.Exception.Message
            Write-Host ("Error checking port " + $p + ": " + $msg)
        }
    }
    if ($allPids) {
        $allPids = $allPids | Sort-Object -Unique
        foreach ($procId in $allPids) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                Write-Host ("Killed process $procId listening on port(s) " + ($ports -join ', '))
            } catch {
                $msg = $_.Exception.Message
                Write-Host ("Failed to kill process " + $procId + ": " + $msg)
            }
        }
    }
    if ($preservedPids) {
        foreach ($entry in $preservedPids) {
            Write-Host ("Preserving Angular dev server PID $($entry.Pid) on port $($entry.Port)")
        }
    }
    return $allPids
}
function Start-ServiceWindow($svc) {
    $cwd = $svc.cwd
    $command = $svc.command
    $log = Join-Path $logDir $svc.log
    $escapedPath = $cwd -replace "'", "''"

    if ($svc.name -in @('backend','schools-api-dotnet','shell')) {
        $escapedCors = $corsList -replace "'", "''"
        # Determine allow-dev-fallback default
        $allowDev = $env:ALLOW_DEV_FALLBACK
        if (-not $allowDev -or $allowDev -eq '') { $allowDev = 'true' }
        $allowDevEsc = $allowDev -replace "'", "''"
        # DB envs (may be set globally by Start-All); pick from environment or empty
        $dbHost = $env:DB_HOST -replace "'", "''"
        $dbPort = $env:DB_PORT -replace "'", "''"
        $dbUser = $env:DB_USER -replace "'", "''"
        $dbPassword = $env:DB_PASSWORD -replace "'", "''"
        $dbName = $env:DB_NAME -replace "'", "''"
        # JWT secret (propagate into wrappers so child services use same signing key in dev)
        $jwtSecret = $env:JWT_SECRET
        if (-not $jwtSecret -or $jwtSecret -eq '') {
            # Attempt to read backend/.env for a configured JWT_SECRET
            try {
                $envPath = Join-Path $scriptRoot '..\backend\.env'
                if (Test-Path $envPath) {
                    $lines = Get-Content $envPath -ErrorAction Stop
                    foreach ($ln in $lines) {
                        if ($ln -match '^\s*JWT_SECRET\s*=\s*(.+)\s*$') {
                            $val = $Matches[1].Trim()
                            # strip surrounding quotes if present
                            if ($val.StartsWith("'") -and $val.EndsWith("'")) { $val = $val.Substring(1, $val.Length-2) }
                            if ($val.StartsWith('"') -and $val.EndsWith('"')) { $val = $val.Substring(1, $val.Length-2) }
                            $jwtSecret = $val
                            break
                        }
                    }
                }
            } catch {
                # ignore file read errors
            }
        }
        # Final fallback default for local dev (insecure — override via env in real dev)
        if (-not $jwtSecret -or $jwtSecret -eq '') { $jwtSecret = 'dev-secret-change-me' }
        $jwtSecret = $jwtSecret -replace "'", "''"

        $wrapper = @"
Set-Location -LiteralPath '$escapedPath'
`$env:CORS_ORIGIN = '$escapedCors'
`$env:ALLOWED_ORIGINS = '$escapedCors'
`$env:ALLOW_DEV_FALLBACK = '$allowDevEsc'
# Database settings injected by orchestrator (only host/port/user/name are echoed)
`$env:DB_HOST = '$dbHost'
`$env:DB_PORT = '$dbPort'
`$env:DB_USER = '$dbUser'
    `$env:DB_PASSWORD = '$dbPassword'
`$env:DB_NAME = '$dbName'
` $env:JWT_SECRET = '$jwtSecret'
Write-Host 'ALLOW_DEV_FALLBACK ->' `$env:ALLOW_DEV_FALLBACK
Write-Host 'DB ->' `$env:DB_HOST`':'`$env:DB_PORT`'/'`$env:DB_NAME
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

    # After the build, automatically switch to the static MF server when built assets exist
    # This enables the built container (`remoteEntry.js`) to be served without requiring
    # the developer to set USE_MF_STATIC manually.
    try {
        $distDir = Join-Path $scriptRoot '..\dist\buildaq-schools\browser'
        $autoStatic = $false
        if (Test-Path $distDir) { $autoStatic = $true }
        if ($env:USE_MF_STATIC -and $env:USE_MF_STATIC.ToString().ToLower() -eq 'true') { $autoStatic = $true }
        if ($autoStatic) {
            Write-Host 'Detected built frontend assets; switching frontend service to mf-build-watch + mf-browsersync (static MF with live reload)'
            # Ensure remoteEntry.json exists in the dist folder. Some developer workflows
            # generate a manifest at `scripts/remoteEntry.js` (JSON payload). If the
            # dist manifest is missing but a scripts manifest exists, copy it into dist
            # so the static server can serve federation metadata.
            try {
                $manifestDistJson = Join-Path $distDir 'remoteEntry.json'
                $manifestDistJs = Join-Path $distDir 'remoteEntry.js'
                $scriptManifest = Join-Path $scriptRoot 'remoteEntry.js'
                # If either JSON or JS artifact is missing in dist and a scripts/remoteEntry.js exists,
                # copy it into dist as both `remoteEntry.json` and `remoteEntry.js` so dev servers
                # and native federation runtimes can fetch the expected path.
                if ((-not (Test-Path $manifestDistJson) -or -not (Test-Path $manifestDistJs)) -and (Test-Path $scriptManifest)) {
                    Write-Host "Copying manifest from $scriptManifest -> $manifestDistJson and $manifestDistJs"
                    Copy-Item -Path $scriptManifest -Destination $manifestDistJson -Force
                    Copy-Item -Path $scriptManifest -Destination $manifestDistJs -Force
                }
            } catch {
                Write-Host 'Warning: failed to copy scripts/remoteEntry.js to dist (continuing)'
            }
            for ($i = 0; $i -lt $services.Count; $i++) {
                if ($services[$i].name -eq 'frontend') {
                    $before = $services[0..($i-1)]
                    $after = $services[($i+1)..($services.Count-1)]

                    # Prefer running the npm script which bundles the watch build and BrowserSync.
                    # If it's not present, fall back to npx concurrently + browser-sync.
                    $pkgPath = Join-Path $scriptRoot '..\package.json'
                    $mfCommand = 'npm run start:mf-watch'
                    if (Test-Path $pkgPath) {
                        try {
                            $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
                            if (-not ($pkg.scripts -and $pkg.scripts.'start:mf-watch')) {
                                $ngWatch = 'npx ng build --watch --configuration development --output-path=dist/buildaq-schools/browser'
                                $bsCmd = 'npx browser-sync start --server "dist/buildaq-schools/browser" --files "dist/buildaq-schools/browser/**/*" --no-ui --no-notify --port 4201'
                                $mfCommand = "npx concurrently `"$ngWatch`" `"$bsCmd`""
                            }
                        } catch {
                            $ngWatch = 'npx ng build --watch --configuration development --output-path=dist/buildaq-schools/browser'
                            $bsCmd = 'npx browser-sync start --server "dist/buildaq-schools/browser" --files "dist/buildaq-schools/browser/**/*" --no-ui --no-notify --port 4201'
                            $mfCommand = "npx concurrently `"$ngWatch`" `"$bsCmd`""
                        }
                    } else {
                        $ngWatch = 'npx ng build --watch --configuration development --output-path=dist/buildaq-schools/browser'
                        $bsCmd = 'npx browser-sync start --server "dist/buildaq-schools/browser" --files "dist/buildaq-schools/browser/**/*" --no-ui --no-notify --port 4201 --cors'
                        $mfCommand = "npx concurrently `"$ngWatch`" `"$bsCmd`""
                    }

                    $mfWatch = @{ name='mf-watch'; cwd=Join-Path $scriptRoot '..'; command=$mfCommand; ports=@(4201); log='mf-watch.log' }

                    $new = @()
                    if ($before) { $new += $before }
                    $new += $mfWatch
                    if ($after) { $new += $after }

                    $services = $new
                    break
                }
            }
        }
    } catch {
        Write-Host 'Warning: failed to auto-detect dist folder for mf-static fallback: ' $_.Exception.Message
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
    # Enable permissive dev auth fallback locally so mock DB logins work
    $env:ALLOW_DEV_FALLBACK = 'true'
    # For safety, require an explicit DEV_FALLBACK_SECRET to enable dev fallback.
    # Do NOT set a weak default here. If it's not set, the backend will refuse
    # fallback logins even when ALLOW_DEV_FALLBACK is true. To enable fallback,
    # set the `DEV_FALLBACK_SECRET` environment variable to a strong value.
    if (-not $env:DEV_FALLBACK_SECRET -or $env:DEV_FALLBACK_SECRET -eq '') {
        Write-Host "DEV_FALLBACK_SECRET not set; dev fallback will be disabled even if ALLOW_DEV_FALLBACK is true. Set DEV_FALLBACK_SECRET in your environment to enable."
    } else {
        Write-Host "DEV_FALLBACK_SECRET is configured for dev fallback (not displayed)."
    }

    # Attempt to read .NET appsettings.json connection string for Postgres and set DB_* env vars
    try {
        $appSettingsPath = Join-Path $scriptRoot '..\schools-api-dotnet\BuildAQ.SchoolsApi\appsettings.json'
        if (Test-Path $appSettingsPath) {
            $appJson = Get-Content $appSettingsPath -Raw | ConvertFrom-Json
            $conn = $appJson.ConnectionStrings.DefaultConnection
            if ($conn) {
                # Parse semicolon-separated key=value pairs
                $pairs = $conn -split ';' | Where-Object { $_ -match '=' }
                foreach ($p in $pairs) {
                    $kv = $p -split '=', 2
                    $k = $kv[0].Trim().ToLower()
                    $v = $kv[1].Trim()
                    switch ($k) {
                        'host' { $env:DB_HOST = $v }
                        'port' { $env:DB_PORT = $v }
                        'database' { $env:DB_NAME = $v }
                        'username' { $env:DB_USER = $v }
                        'user id' { $env:DB_USER = $v }
                        'password' { $env:DB_PASSWORD = $v }
                    }
                }
                Write-Host "Injected DB env from appsettings.json: $($env:DB_HOST):$($env:DB_PORT)/$($env:DB_NAME) (user: $($env:DB_USER))"
            }
        }
    } catch {
        Write-Host "Warning: failed to read appsettings.json for DB env injection: $($_.Exception.Message)"
    }

    # If an appsettings.json provided DB_HOST and no DB_TYPE was explicitly set,
    # assume PostgreSQL so the backend uses the real DB instead of the mock.
    if ($env:DB_HOST -and (-not $env:DB_TYPE -or $env:DB_TYPE -eq '')) {
        $env:DB_TYPE = 'postgresql'
        Write-Host "Setting DB_TYPE=postgresql because DB_HOST is present"
    }

    # When connecting to Azure Database for PostgreSQL, require SSL by default
    # so clients use an encrypted connection. Do not echo the SSL setting.
    if ($env:DB_HOST -and $env:DB_HOST.ToLower().Contains('postgres.database.azure.com')) {
        if (-not $env:DB_SSL -or $env:DB_SSL -eq '') {
            $env:DB_SSL = 'true'
            Write-Host 'Setting DB_SSL=true for Azure Postgres host'
        }
        # Some managed servers require TLS but have certificates signed by public CAs;
        # default to verifying certs. If you run into cert verification issues set
        # `DB_SSL_REJECT=false` in your environment to bypass validation (not recommended).
    }

    # Kill processes listening on dev ports (cleanup) and start fresh
    $ports = $services | ForEach-Object { $_.ports } | ForEach-Object { $_ } | Sort-Object -Unique
    if ($ports) { Write-Host "Killing listeners on ports: $($ports -join ', ')"; Kill-Listeners -ports $ports }

    # Retry configuration for flaky frontend/shell startup
    $maxStartAttempts = 5
    $retryDelaySeconds = 3

    # (debug option removed) The script no longer overrides the backend command.

    foreach ($svc in $services) {
        if (-not (Test-Path $svc.cwd)) {
            Write-Host "Skipping $($svc.name) - directory not found: $($svc.cwd)"
            continue
        }

        $attempt = 1
        $started = $false

        while ($attempt -le $maxStartAttempts -and -not $started) {
            Write-Host "Starting attempt $attempt/$maxStartAttempts for service: $($svc.name)"
            Start-ServiceWindow $svc
            Start-Sleep -Milliseconds 500

            if ($svc.name -eq 'backend') {
                if (Wait-For-Url 'http://localhost:3000/' 30) {
                    Write-Host 'Backend is up'
                    $started = $true
                } else {
                    Write-Host "Backend did not respond on attempt $attempt"
                }
            } elseif ($svc.name -eq 'frontend') {
                if (Wait-For-Url 'http://localhost:4201/' 30) {
                    Write-Host 'Frontend is up'
                    $started = $true
                } else {
                    Write-Host "Frontend did not respond on attempt $attempt"
                }
            } elseif ($svc.name -eq 'mf-watch' -or $svc.name -eq 'mf-browsersync' -or $svc.name -eq 'mf-static') {
                # For the static MF server (BrowserSync or npm script variant), ensure the federation manifest or container is available
                if (Wait-For-Url 'http://localhost:4201/remoteEntry.js' 20 -or Wait-For-Url 'http://localhost:4201/remoteEntry.json' 20) {
                    Write-Host 'MF static server is up (remoteEntry available)'
                    $started = $true
                } else {
                    Write-Host "MF static server did not respond with remoteEntry on attempt $attempt"
                }
            } elseif ($svc.name -eq 'shell') {
                # shell typically listens on 4200
                if (Wait-For-Url 'http://localhost:4200/' 20) {
                    Write-Host 'Shell is up'
                    $started = $true
                } else {
                    Write-Host "Shell did not respond on attempt $attempt"
                }
            } else {
                # For other services, consider them started immediately after launch
                $started = $true
            }

            if (-not $started -and $attempt -lt $maxStartAttempts) {
                Write-Host "Retrying $($svc.name) after $retryDelaySeconds seconds..."
                # Kill listeners on the service ports to ensure a clean restart
                if ($svc.ports) { Kill-Listeners -ports $svc.ports | Out-Null }
                Start-Sleep -Seconds $retryDelaySeconds
            }

            $attempt++
        }

        if (-not $started) { Write-Host "Warning: $($svc.name) did not start after $maxStartAttempts attempts" }
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
            # Here-string terminator must be at column 1
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



#----only --- IGNORE ---#
# stop existing (if any)
# $p = Get-Process -Name BuildAQ.SchoolsApi -ErrorAction SilentlyContinue
# if ($p) { Stop-Process -Id $p.Id -Force }

# # open a new PowerShell window and run the API there (you'll see logs)
# Start-Process -FilePath 'powershell' -ArgumentList '-NoExit','-Command','Push-Location \"C:\\DEV\\buildaq-schools\\schools-api-dotnet\\BuildAQ.SchoolsApi\"; dotnet run --no-launch-profile'

# Token Generation
# Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/auth/login' -Method Post -ContentType 'application/json' -Body (@{username='admin@demo';password='BuildAQDemo!2025';tenant='1'} | ConvertTo-Json) -ErrorAction Stop | ConvertTo-Json -Depth 5


# #start backend 
# Start-Process -FilePath 'powershell' -ArgumentList '-NoExit','-Command','Push-Location "C:\DEV\buildaq-schools\backend"; npm run dev' ; Start-Sleep -Seconds 6


# Login with real DB-backed user (replace values)
# $login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method Post -ContentType 'application/json' -Body (ConvertTo-Json @{ username='admin@demo'; password='BuildAQDemo!2025'; tenant='demo.buildaq.com' })
# $token = $login.token
# Write-Host "Token:" $token

# # Call protected endpoints
# Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/classes/summary' -Method GET -Headers @{ Authorization = "Bearer $token" } -Verbose
# Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/teachers/summary' -Method GET -Headers @{ Authorization = "Bearer $token" } -Verbose