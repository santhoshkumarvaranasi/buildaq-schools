# Start the .NET API (BuildAQ.SchoolsApi) in a new PowerShell window and log output
param()

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$cwd = Join-Path $scriptRoot '..\schools-api-dotnet\BuildAQ.SchoolsApi'
$prepare = Join-Path $scriptRoot 'prepare-dev-env.ps1'
if (Test-Path $prepare) { . $prepare }
$logDir = Join-Path $scriptRoot 'logs'
New-Item -Path $logDir -ItemType Directory -Force | Out-Null
$log = Join-Path $logDir 'schools-api-dotnet.log'

$cmd = "Set-Location -LiteralPath '$cwd'; Write-Host 'Starting .NET API (dotnet run)'; dotnet run --no-launch-profile 2>&1 | Tee-Object -FilePath '$log'"
Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoExit','-Command',$cmd -WorkingDirectory $cwd -WindowStyle Normal | Out-Null
Write-Host "Launched .NET API (logs -> $log)"
