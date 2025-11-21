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
  // Always return the manifest JSON for /remoteEntry.js to satisfy native-federation
  // loaders that attempt to parse the URL as JSON first. This avoids SyntaxError
  // when the dev shim (JS) is not valid JSON.
  const manifestPath = path.join(distDir, 'remoteEntry.json');
  if (fs.existsSync(manifestPath)) {
    try {
      res.setHeader('Content-Type', 'application/json');
      console.log('[mf-static] returning manifest JSON for /remoteEntry.js');
      return res.send(fs.readFileSync(manifestPath, 'utf8'));
    } catch (e) {
      console.warn('[mf-static] failed to return manifest JSON', e && e.message);
    }
  }
  return res.status(404).send('not found');
});

// Intercept requests for JS files and map manifest outFileName candidates to the
// actual hashed files in `dist` when necessary. This handles the case where the
// manifest lists an outFileName that doesn't match the generated hashed filename.
// Use a RegExp route to avoid path-to-regexp parameter parsing errors with '/*'.
app.get(/.*\.js$/, (req, res, next) => {
  try {
    const requested = path.basename(req.path);
    const candidatePath = path.join(distDir, requested);
    if (fs.existsSync(candidatePath)) {
      return res.sendFile(candidatePath);
    }

    // If the exact file isn't present, try to match from manifest
    const manifestPath = path.join(distDir, 'remoteEntry.json');
    if (!fs.existsSync(manifestPath)) return next();
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const files = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));

    // Try to find a manifest entry whose outFileName base matches the requested name
    const match = (manifest.exposes || []).map(e => e.outFileName).find(o => {
      if (!o) return false;
      const base = o.split('-')[0];
      return requested.startsWith(base) || requested === o;
    });
    if (match) {
      // find actual file in dist that starts with base
      const base = match.split('-')[0];
      const found = files.find(f => f.startsWith(base));
      if (found) {
        console.warn('[mf-static] remapping requested', requested, '->', found);
        return res.sendFile(path.join(distDir, found));
      }
    }

    // As a last resort, try heuristics (SchoolsModule, Component tokens)
    const heur = files.find(f => /SchoolsModule|Component|remote-/i.test(f));
    if (heur) {
      console.warn('[mf-static] remapping requested', requested, '->', heur);
      return res.sendFile(path.join(distDir, heur));
    }

    return next();
  } catch (e) {
    console.error('[mf-static] error remapping js request', e && e.message);
    return next();
  }
});

// Serve static assets (after our custom routes) so routes like /importmap.json are handled
app.use(express.static(distDir, { index: false }));

// Fallback to index.html for SPA navigation
// Use app.use to avoid path-to-regexp parameter parsing issues with a bare '*' route
app.use((req, res) => {
  const index = path.join(distDir, 'index.html');
  if (fs.existsSync(index)) {
    // Inject es-module-shims and importmap.json reference if not present (helpful for dev server)
    try {
      let html = fs.readFileSync(index, 'utf8');
      let shimScript = '<script src="https://ga.jspm.io/npm:es-module-shims@1.5.12/dist/es-module-shims.js"></script>'; 
      const importmapPath = path.join(distDir, 'importmap.json');
      let importmapTag = '';
      if (fs.existsSync(importmapPath)) {
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
            // If parsing fails, fall back to raw contents
          }
          importmapTag = `<script type="importmap">${im}</script>`;
        } catch (e) {
          importmapTag = '<script type="importmap" src="/importmap.json"></script>';
        }
      } else {
        importmapTag = '<script type="importmap" src="/importmap.json"></script>';
      }
      html = html.replace(/rel=\"modulepreload\"/gi, 'rel="preload" as="script"');
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
