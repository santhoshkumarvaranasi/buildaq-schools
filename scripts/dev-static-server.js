#!/usr/bin/env node
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 4201;

const distDir = path.join(__dirname, '..', 'dist', 'buildaq-schools', 'browser');
const nfCacheRoot = path.join(__dirname, '..', 'node_modules', '.cache', 'native-federation');
const nfCacheDirs = [
  path.join(nfCacheRoot, 'schools'),
  nfCacheRoot,
];

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

// Native federation dev runtime may subscribe to this endpoint for rebuild events.
// Serve a valid SSE stream to avoid MIME/type errors in the browser console.
app.get('/@angular-architects/native-federation:build-notifications', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  // Initial ping event (shape expected by runtime)
  res.write(`data: ${JSON.stringify({ type: 'connected', ts: Date.now() })}\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(heartbeat);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
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

    // Serve shared federation bundles from native-federation cache if present
    for (const cacheDir of nfCacheDirs) {
      const cachedPath = path.join(cacheDir, requested);
      if (fs.existsSync(cachedPath)) {
        return res.sendFile(cachedPath);
      }
    }

    // If the exact file isn't present, try to match from manifest
    const manifestPath = path.join(distDir, 'remoteEntry.json');
    if (!fs.existsSync(manifestPath)) return next();
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const distFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));

    const exposeFiles = (manifest.exposes || []).map(e => e.outFileName).filter(Boolean);
    const sharedFiles = (manifest.shared || []).map(s => s.outFileName).filter(Boolean);

    // Try conservative remap for expose/shared files only (avoid remapping random files)
    const remapCandidates = [...exposeFiles, ...sharedFiles];
    const match = remapCandidates.find(o => {
      if (!o) return false;
      const base = o.split('-')[0];
      return requested === o || requested.startsWith(base);
    });

    if (match) {
      const base = match.split('-')[0];

      const foundInDist = distFiles.find(f => f === match) || distFiles.find(f => f.startsWith(base));
      if (foundInDist) {
        console.warn('[mf-static] remapping requested', requested, '->', foundInDist);
        return res.sendFile(path.join(distDir, foundInDist));
      }

      for (const cacheDir of nfCacheDirs) {
        try {
          const cacheFiles = fs.existsSync(cacheDir)
            ? fs.readdirSync(cacheDir).filter(f => f.endsWith('.js'))
            : [];
          const foundInCache = cacheFiles.find(f => f === match) || cacheFiles.find(f => f.startsWith(base));
          if (foundInCache) {
            console.warn('[mf-static] remapping requested', requested, '->', foundInCache, '(cache)');
            return res.sendFile(path.join(cacheDir, foundInCache));
          }
        } catch (e) {
          // ignore per-cache read errors
        }
      }
    }

    // For unresolved JS files, return 404 instead of falling back to index.html
    // to prevent confusing ESM errors (e.g., missing named exports from HTML/other files).
    return res.status(404).send('not found');
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
