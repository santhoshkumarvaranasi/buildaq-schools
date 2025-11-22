const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Serve remotes.json for module federation registry.
// Behavior: if a repo-level public/remotes.json exists, return it.
// Otherwise return a sensible default mapping for local development.
router.get('/remotes.json', (req, res) => {
  try {
    const repoPublic = path.resolve(__dirname, '..', '..', '..', 'public', 'remotes.json');
    if (fs.existsSync(repoPublic)) {
      return res.sendFile(repoPublic);
    }
  } catch (e) {
    // ignore and fall through to default
  }

  // Default mapping: point `schools` remote to localhost:4201
    const defaultRemotes = {
      schools: 'http://localhost:3000/assets/remoteEntry.json'
  };
  res.json(defaultRemotes);
});

// Proxy runtime requests for the remoteEntry JSON to the MF static server.
// This allows callers to fetch /assets/remoteEntry.json from the backend and
// have the backend forward the request to the dev static server running on port 4201.
router.get('/remoteEntry.json', (req, res) => {
  const targetPath = 'remoteEntry.json';
  const upstream = `http://localhost:4201/${targetPath}`;
  const distPath = path.resolve(__dirname, '..', '..', '..', 'dist', 'buildaq-schools', 'browser', targetPath);

  const http = upstream.startsWith('https') ? require('https') : require('http');

  // Try upstream first
  const upstreamReq = http.get(upstream, (upRes) => {
    if (upRes.statusCode && upRes.statusCode >= 200 && upRes.statusCode < 300) {
      // Stream and also capture body to cache file for fallback
      const chunks = [];
      upRes.on('data', (c) => chunks.push(c));
      upRes.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString('utf8');
          // Forward the content-type header if present
          if (upRes.headers && upRes.headers['content-type']) res.setHeader('Content-Type', upRes.headers['content-type']);
          res.status(upRes.statusCode).send(body);
        } catch (e) {
          console.warn('remotes: upstream read error', e && e.message);
          res.status(502).json({ error: 'Bad gateway', message: 'Failed to read remote entry from upstream' });
        }
      });
      return;
    }

    // Non-success upstream status: fall through to local fallbacks
    console.warn('remotes: upstream responded', upRes.statusCode, 'falling back to local manifest');
    tryLocalFallback();
  });

  upstreamReq.on('error', (err) => {
    console.warn('remotes: upstream error', err && err.message, '-> falling back to local');
    tryLocalFallback();
  });

  function tryLocalFallback() {
    // 1) Try dist folder (most authoritative)
    if (fs.existsSync(distPath)) {
      return res.sendFile(distPath);
    }

    // 2) Nothing else: return error. Keep behavior minimal and require
    // the build/watch to produce `remoteEntry.json` in dist.
    return res.status(502).json({ error: 'Bad gateway', message: 'Remote manifest unavailable (upstream and dist fallbacks failed)' });
  }
});

module.exports = router;

// Server-Sent Events endpoint to notify clients when remote assets change.
// Clients can subscribe and trigger a reload when a rebuild occurs.
router.get('/remote-events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  // Determine folder and files to watch for changes. Watch the whole dist/browser
  // folder (JS/JSON/CSS) because incremental builds often update chunk files
  // rather than rewriting the top-level manifest. Also include script manifest
  // and cached file as fallbacks.
  const distDir = path.resolve(__dirname, '..', '..', '..', 'dist', 'buildaq-schools', 'browser');
  const cacheFile = null;

  let lastMtime = 0;
  function getLatestMtime() {
    let mt = 0;
    try {
      if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir);
        for (const f of files) {
          try {
            const p = path.join(distDir, f);
            const s = fs.statSync(p);
            const t = s.mtimeMs || (s.mtime && s.mtime.getTime()) || 0;
            if (t > mt) mt = t;
          } catch (e) { /* ignore per-file errors */ }
        }
      }
    } catch (e) { /* ignore dir read errors */ }

    // Only consider files in dist; incremental builds update chunk files here.

    return mt;
  }

  // Send a comment to keep connection alive
  res.write(': connected\n\n');

  // Poll for changes every second
  lastMtime = getLatestMtime();
  const iv = setInterval(() => {
    try {
      const now = getLatestMtime();
      if (now > lastMtime) {
        lastMtime = now;
        const payload = JSON.stringify({ ts: now });
        res.write(`event: reload\n`);
        res.write(`data: ${payload}\n\n`);
      } else {
        // heartbeat to keep connection alive
        res.write(`:\n`);
      }
    } catch (e) {
      // ignore
    }
  }, 1000);

  req.on('close', () => {
    clearInterval(iv);
  });
});

// Serve or remap arbitrary JS asset requests under /assets/*.js
// This helps when the shell requests module files like SchoolsModule-XXX.js
// via the backend origin. The router is mounted at /assets so this matches
// /assets/<file>.js requests.
router.get('/*.js', (req, res) => {
  const reqFile = req.path.replace(/^\/+/, ''); // e.g. SchoolsModule-VUAVDPXB.js
  const distDir = path.resolve(__dirname, '..', '..', '..', 'dist', 'buildaq-schools', 'browser');
  const distFile = path.join(distDir, reqFile);

  // 1) Serve exact file from dist if present
  if (fs.existsSync(distFile)) {
    return res.sendFile(distFile);
  }

  // 2) Try to remap via manifest (remoteEntry.json) in dist or scripts
  try {
    const manifestPath = path.join(distDir, 'remoteEntry.json');
    if (fs.existsSync(manifestPath)) {
      let manifestRaw = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestRaw);
      const exposes = manifest.exposes || [];
      const outNames = exposes.map(e => e.outFileName).filter(Boolean);
      // Try to find a manifest entry that matches the requested file or its base
      const match = outNames.find(o => o === reqFile || reqFile.startsWith(o.split('-')[0]));
      if (match) {
        // Find an actual JS file in dist that matches the base or exact name
        const files = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
        const base = match.split('-')[0];
        const found = files.find(f => f === match) || files.find(f => f.startsWith(base));
        if (found) {
          return res.sendFile(path.join(distDir, found));
        }
      }
    }
  } catch (e) {
    console.warn('assets remap error:', e && e.message);
  }

  // 3) Fall back to proxying the request to the mf static server (4201)
  try {
    const upstreamUrl = `http://localhost:4201/${reqFile}`;
    const http = upstreamUrl.startsWith('https') ? require('https') : require('http');
    const proxyReq = http.get(upstreamUrl, (proxyRes) => {
      res.statusCode = proxyRes.statusCode || 200;
      Object.entries(proxyRes.headers || {}).forEach(([k, v]) => {
        try { res.setHeader(k, v); } catch (e) { /* ignore header errors */ }
      });
      proxyRes.pipe(res);
    });
    proxyReq.on('error', (err) => {
      console.warn('assets proxy error:', err && err.message);
      res.status(502).json({ error: 'Bad gateway', message: 'Failed to proxy asset request' });
    });
    return;
  } catch (e) {
    console.warn('assets proxy unexpected error:', e && e.message);
    return res.status(502).json({ error: 'Bad gateway', message: 'Asset unavailable' });
  }
});
