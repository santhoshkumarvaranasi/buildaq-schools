# Minimal starter for buildaq-shell
param(
	[int] $Port = 4200
)

# Resolve script and repo paths
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Join-Path $scriptRoot '..'


# Determine the shell project folder. Prefer SHELL_PATH env var, else search common locations:
# 1) <repoRoot>/buildaq-shell
# 2) sibling folder next to repo root (i.e. parent(buildaq-schools)/buildaq-shell)
# 3) top-level workspace folder (parent(parent(repoRoot))/buildaq-shell)
$shellCandidates = @()
if ($env:SHELL_PATH) { $shellCandidates += $env:SHELL_PATH }

# normalize repo root
try { $repoRoot = (Get-Item -LiteralPath (Join-Path $scriptRoot '..')).FullName } catch { $repoRoot = $repoRoot }
$shellCandidates += Join-Path $repoRoot 'buildaq-shell'

$repoParent = Split-Path $repoRoot -Parent
if ($repoParent) { $shellCandidates += Join-Path $repoParent 'buildaq-shell' }

$repoGrandParent = Split-Path $repoParent -Parent
if ($repoGrandParent) { $shellCandidates += Join-Path $repoGrandParent 'buildaq-shell' }

$shellPath = $null
foreach ($cand in $shellCandidates) {
	if ($cand -and (Test-Path $cand)) { $shellPath = (Get-Item -LiteralPath $cand).FullName; break }
}

if (-not $shellPath) {
	Write-Error "Shell path not found. Tried: $($shellCandidates -join ', ')"
	exit 1
}

$cwd = $shellPath

Write-Host "Starting buildaq-shell in: $cwd on port $Port"

# Build the PowerShell command to run in the new window.
# Use `npx ng serve --project buildaq-shell --port <port>` to avoid npm start argument forwarding ambiguity.
$psCommand = "Set-Location -LiteralPath `"$cwd`"; npx ng serve --project buildaq-shell --port $Port"
$psArgs = @('-NoExit', '-NoProfile', '-Command', $psCommand)

Start-Process -FilePath 'powershell.exe' -ArgumentList $psArgs -WorkingDirectory $cwd -WindowStyle Normal | Out-Null

Write-Host "Launched shell (new PowerShell window). If it doesn't start, run the following in a terminal to debug:" 
Write-Host "    Set-Location -LiteralPath `"$cwd`"`n    npx ng serve --project buildaq-shell --port $Port"
