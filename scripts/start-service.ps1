# Generic helper: start a named service with the small starters included in this folder.
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('backend','frontend','mf-ng-watch','mf-browsersync','schools-api-dotnet','shell')]
    [string]$Name
)

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$prepare = Join-Path $scriptRoot 'prepare-dev-env.ps1'
if (Test-Path $prepare) { . $prepare }
switch ($Name) {
    'backend' { & (Join-Path $scriptRoot 'start-backend.ps1') }
    'frontend' { & (Join-Path $scriptRoot 'start-frontend.ps1') }
    'mf-ng-watch' { & (Join-Path $scriptRoot 'start-mf-watch.ps1') }
    'mf-browsersync' { & (Join-Path $scriptRoot 'start-mf-browsersync.ps1') }
    'schools-api-dotnet' { & (Join-Path $scriptRoot 'start-dotnet.ps1') }
    'shell' { & (Join-Path $scriptRoot 'start-shell.ps1') }
    default { Write-Host "Unknown service: $Name" }
}
