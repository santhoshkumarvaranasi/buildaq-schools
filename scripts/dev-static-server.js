#!/usr/bin/env node
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 4201;

const distDir = path.join(__dirname, '..', 'dist', 'buildaq-schools', 'browser');

if (!fs.existsSync(distDir)) {
  console.error('Dist folder not found. Run `npm run build` first. Expected:', distDir);
  process.exit(1);
}

// Serve static assets
// Set CORS and caching headers for JS/JSON assets so host can fetch them cross-origin
app.use((req, res, next) => {
  // Allow local host dev ports to fetch assets
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});


// Serve a corrected importmap.json (prefix bare filenames with './') so browsers
// resolving the import map endpoint get valid relative URLs rather than bare specifiers.
app.get('/importmap.json', (req, res) => {
  const importmapPath = path.join(distDir, 'importmap.json');
  if (!fs.existsSync(importmapPath)) return res.status(404).send('not found');
  try {
    let im = fs.readFileSync(importmapPath, 'utf8');
    try {
      const imJson = JSON.parse(im);
      if (imJson && imJson.imports) {
        for (const key of Object.keys(imJson.imports)) {
          const val = imJson.imports[key];
          if (typeof val === 'string' && !/^(?:https?:|\/|\.\/|\.\.\/)/i.test(val)) {
            imJson.imports[key] = './' + val;
          }
        }
      }
      im = JSON.stringify(imJson);
    } catch (e) {
      // ignore parse errors and serve raw
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(im);
  } catch (err) {
    console.error('Error serving importmap.json', err);
    res.status(500).send('error');
  }
});

// Serve remoteEntry.json directly if requested
app.get('/remoteEntry.json', (req, res) => {
  const manifestPath = path.join(distDir, 'remoteEntry.json');
  if (!fs.existsSync(manifestPath)) return res.status(404).send('not found');
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(manifestPath);
});

// Serve a runtime remoteEntry.js that proxies to the actual expose container file.
app.get('/remoteEntry.js', (req, res) => {
  const manifestPath = path.join(distDir, 'remoteEntry.json');
  if (!fs.existsSync(manifestPath)) return res.status(404).send('not found');
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    // prefer the first expose entry (./SchoolsModule)
    const expose = (manifest.exposes && manifest.exposes[0]) || null;
    if (!expose || !expose.outFileName) return res.status(500).send('invalid manifest');
    const containerPath = path.join(distDir, expose.outFileName);
    if (!fs.existsSync(containerPath)) return res.status(404).send('container not found');
    // Serve the container file directly as the remoteEntry implementation
    res.setHeader('Content-Type', 'application/javascript');
    res.send(fs.readFileSync(containerPath, 'utf8'));
  } catch (err) {
    console.error('Error serving remoteEntry.js', err);
    res.status(500).send('error');
  }
});

// Serve static assets (after our custom routes) so routes like /importmap.json are handled
app.use(express.static(distDir, { index: false }));

// Fallback to index.html for SPA navigation
app.get('*', (req, res) => {
  const index = path.join(distDir, 'index.html');
  if (fs.existsSync(index)) {
    // Inject es-module-shims and importmap.json reference if not present (helpful for dev server)
    try {
      let html = fs.readFileSync(index, 'utf8');
      // Always inject shim + inline importmap to avoid race conditions where the built index
      // may not include an importmap (builds can overwrite dist). Inline the importmap.json
      // so resolution works even if the separate file isn't requested in time.
      let shimScript = '<script src="https://ga.jspm.io/npm:es-module-shims@1.5.12/dist/es-module-shims.js"></script>'; 
      // Try to inline importmap.json if present
      const importmapPath = path.join(distDir, 'importmap.json');
      let importmapTag = '';
      if (fs.existsSync(importmapPath)) {
        try {
          let im = fs.readFileSync(importmapPath, 'utf8');
          // Ensure import map values are valid URLs/relative paths. Browsers ignore bare
          // specifier values (like "_angular_core....js"). Prefix with './' when needed.
          try {
            const imJson = JSON.parse(im);
            if (imJson && imJson.imports) {
              for (const key of Object.keys(imJson.imports)) {
                const val = imJson.imports[key];
                if (typeof val === 'string' && !/^(?:https?:|\/|\.\/|\.\.\/)/i.test(val)) {
                  imJson.imports[key] = './' + val;
                }
              }
            }
            im = JSON.stringify(imJson);
          } catch (e) {
            // If parsing fails, fall back to raw contents
          }
          importmapTag = `<script type="importmap">${im}</script>`;
        } catch (e) {
          importmapTag = '<script type="importmap" src="/importmap.json"></script>';
        }
      } else {
        importmapTag = '<script type="importmap" src="/importmap.json"></script>';
      }
      // Replace any modulepreload links with preload as=script to avoid native module execution
      html = html.replace(/rel=\"modulepreload\"/gi, 'rel="preload" as="script"');
      // Insert shim + importmap at the top of the <head> so they load before
      // any module scripts or modulepreload links. This avoids a race where
      // module code executes before es-module-shims has parsed the importmap.
      if (!/es-module-shims/.test(html)) {
        html = html.replace(/<head[^>]*>/i, (m) => m + '\n' + shimScript + '\n' + importmapTag);
      } else if (!/type="importmap"/i.test(html)) {
        html = html.replace(/<head[^>]*>/i, (m) => m + '\n' + importmapTag);
      }
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (e) {
      console.error('Error reading index.html for injection', e);
      res.sendFile(index);
    }
  } else {
    res.status(404).send('not found');
  }
});

app.listen(port, () => {
  console.log(`MF static server listening on http://localhost:${port} serving ${distDir}`);
});
