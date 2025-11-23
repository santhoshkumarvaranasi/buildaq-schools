# Start BrowserSync to serve the built micro-frontend dist folder and log output
param()

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Join-Path $scriptRoot '..'
$cwd = $repoRoot
$prepare = Join-Path $scriptRoot 'prepare-dev-env.ps1'
if (Test-Path $prepare) { . $prepare }
$logDir = Join-Path $scriptRoot 'logs'
New-Item -Path $logDir -ItemType Directory -Force | Out-Null
$log = Join-Path $logDir 'mf-browsersync.log'

$mfOutputRel = 'dist/buildaq-schools'
$mfOutputAbs = (Join-Path $repoRoot $mfOutputRel) -replace '\\','/'
$mfFilesGlobAbs = "$mfOutputAbs/**/*"

$cmd = "Set-Location -LiteralPath '$cwd'; Write-Host 'Starting mf-browsersync (browser-sync)'; npx browser-sync start --server `"$mfOutputAbs`" --files `"$mfFilesGlobAbs`" --no-ui --no-notify --port 4201 --cors 2>&1 | Tee-Object -FilePath '$log'"
Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit','-Command',$cmd -WorkingDirectory $cwd -WindowStyle Normal | Out-Null
Write-Host "Launched mf-browsersync (logs -> $log)"
