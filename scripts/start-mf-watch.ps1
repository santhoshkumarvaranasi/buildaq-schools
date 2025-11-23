# Start micro-frontend build watch (ng build --watch) in a new PowerShell window and log output
param()

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Join-Path $scriptRoot '..'
$cwd = $repoRoot
$prepare = Join-Path $scriptRoot 'prepare-dev-env.ps1'
if (Test-Path $prepare) { . $prepare }
$logDir = Join-Path $scriptRoot 'logs'
New-Item -Path $logDir -ItemType Directory -Force | Out-Null
$log = Join-Path $logDir 'mf-ng-watch.log'

# Use the same output path as the orchestrator
$mfOutputRel = 'dist/buildaq-schools'
$mfOutputAbs = (Join-Path $repoRoot $mfOutputRel) -replace '\\','/'

$cmd = "Set-Location -LiteralPath '$cwd'; Write-Host 'Starting mf-ng-watch (ng build --watch)'; npx ng build --watch --configuration development --output-path=\"$mfOutputAbs\" 2>&1 | Tee-Object -FilePath '$log'"
Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit','-Command',$cmd -WorkingDirectory $cwd -WindowStyle Normal | Out-Null
Write-Host "Launched mf-ng-watch (logs -> $log)"
