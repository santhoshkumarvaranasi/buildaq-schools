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


# npx ng build --configuration=development

# cd C:\DEV\buildaq-schools
# ng build --configuration=production --base-href=https://schools.buildaq.com/ --output-path=dist/buildaq-schools-ghp  
# cd C:\DEV\buildaq-schools\dist\buildaq-schools-ghp\browser
# copy index.html 404.html
# npx angular-cli-ghpages --dir=. --branch=gh-pages --cname=schools.buildaq.com


# cd C:\DEV\buildaq-shell
# ng build --configuration=production --base-href=https://shell.buildaq.com/ --output-path=dist/buildaq-shell-ghp  
# cd C:\DEV\buildaq-shell\dist\buildaq-shell-ghp\browser
# copy index.html 404.html
# npx angular-cli-ghpages --dir=. --branch=gh-pages --cname=shell.buildaq.com