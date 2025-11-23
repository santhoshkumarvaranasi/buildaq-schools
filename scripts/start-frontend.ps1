# Start the frontend (Angular dev server) in a new PowerShell window and log output
param()

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Join-Path $scriptRoot '..'
$cwd = $repoRoot
$prepare = Join-Path $scriptRoot 'prepare-dev-env.ps1'
if (Test-Path $prepare) { . $prepare }
$logDir = Join-Path $scriptRoot 'logs'
New-Item -Path $logDir -ItemType Directory -Force | Out-Null
$log = Join-Path $logDir 'frontend.log'

$cmd = "Set-Location -LiteralPath '$cwd'; Write-Host 'Starting frontend (ng serve buildaq-schools)'; ng serve buildaq-schools 2>&1 | Tee-Object -FilePath '$log'"
Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit','-Command',$cmd -WorkingDirectory $cwd -WindowStyle Normal | Out-Null
Write-Host "Launched frontend (logs -> $log)"
