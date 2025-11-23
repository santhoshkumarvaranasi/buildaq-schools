# Prepare and export common development environment variables for child processes.
# This script is intended to be dot-sourced or executed by the per-service starters
# so the started processes inherit the same environment configuration used by
# the main orchestrator (`start-dev.ps1`).

param()

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Join-Path $scriptRoot '..'

# CORS / allowed origins
$corsList = $env:DEV_ALLOWED_ORIGINS
if (-not $corsList -or $corsList -eq '') { $corsList = 'http://localhost:4200,http://localhost:4201' }
$env:CORS_ORIGIN = $corsList
$env:ALLOWED_ORIGINS = $corsList

# Allow dev fallback default
$allowDev = $env:ALLOW_DEV_FALLBACK
if (-not $allowDev -or $allowDev -eq '') { $allowDev = 'true' }
$env:ALLOW_DEV_FALLBACK = $allowDev

# Attempt to read JWT_SECRET from backend/.env if not already set
$jwtSecret = $env:JWT_SECRET
if (-not $jwtSecret -or $jwtSecret -eq '') {
    $envPath = Join-Path $repoRoot 'backend\.env'
    if (Test-Path $envPath) {
        try {
            $lines = Get-Content $envPath -ErrorAction Stop
            foreach ($ln in $lines) {
                if ($ln -match '^[\s#]*JWT_SECRET\s*=\s*(.+)\s*$') {
                    $val = $Matches[1].Trim()
                    if ($val.StartsWith("'") -and $val.EndsWith("'")) { $val = $val.Substring(1,$val.Length-2) }
                    if ($val.StartsWith('"') -and $val.EndsWith('"')) { $val = $val.Substring(1,$val.Length-2) }
                    $jwtSecret = $val
                    break
                }
            }
        } catch {
            # ignore
        }
    }
}
if (-not $jwtSecret -or $jwtSecret -eq '') { $jwtSecret = 'dev-secret-change-me' }
$env:JWT_SECRET = $jwtSecret

# Read .NET appsettings.json for DB connection (if present)
$appSettingsPath = Join-Path $repoRoot 'schools-api-dotnet\BuildAQ.SchoolsApi\appsettings.json'
if (Test-Path $appSettingsPath) {
    try {
        $appJson = Get-Content $appSettingsPath -Raw | ConvertFrom-Json
        $conn = $appJson.ConnectionStrings.DefaultConnection
        if ($conn) {
            $pairs = $conn -split ';' | Where-Object { $_ -match '=' }
            foreach ($p in $pairs) {
                $kv = $p -split '=',2
                if ($kv.Count -lt 2) { continue }
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
        }
    } catch {
        # ignore parse errors
    }
}

# Default DB type when a host is present
if ($env:DB_HOST -and (-not $env:DB_TYPE -or $env:DB_TYPE -eq '')) { $env:DB_TYPE = 'postgresql' }

# Enable DB SSL for Azure-managed hosts by default
if ($env:DB_HOST -and $env:DB_HOST.ToLower().Contains('postgres.database.azure.com')) {
    if (-not $env:DB_SSL -or $env:DB_SSL -eq '') { $env:DB_SSL = 'true' }
}

Write-Host "Prepared dev env: CORS=$($env:CORS_ORIGIN) DB=$($env:DB_HOST):$($env:DB_PORT)/$($env:DB_NAME)"
