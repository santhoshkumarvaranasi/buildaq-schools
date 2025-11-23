Quick dev start helpers

This folder contains small, focused PowerShell scripts to start individual dev services in their own windows and capture logs under `scripts/logs`.

Defaults:
- **shell (buildaq-shell)**: port `4200`
- **remote (buildaq-schools)**: port `4201`

Usage examples (PowerShell):

Start the Node backend:
```
cd scripts
.\start-backend.ps1
```

Start the Angular dev server:
```
cd scripts
.\start-frontend.ps1
```

Start the built micro-frontend watch (writes to `dist/buildaq-schools`):
```
cd scripts
.\start-mf-watch.ps1
```

Start BrowserSync to serve the built dist:
```
cd scripts
.\start-mf-browsersync.ps1
```

Start the .NET API:
```
cd scripts
.\start-dotnet.ps1
```

Start the shell (buildaq-shell), uses `SHELL_PATH` env var if set or `../buildaq-shell` (defaults to port `4200`):
```
cd scripts
.\start-shell.ps1
```
To force a different port (e.g. `4200` explicitly):
```
.\start-shell.ps1 -Port 4200
```

Start any service by name using the generic helper:
```
cd scripts
.\start-service.ps1 -Name backend
```

Notes:
- These scripts are intentionally small and independent of the main orchestrator so you can start a single service on demand.
- Logs are written into `scripts/logs` and each script creates that directory automatically.
- If you prefer the full orchestrator (which builds and orchestrates multiple services), keep using `start-dev.ps1` in this folder.
