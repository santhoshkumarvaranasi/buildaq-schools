const http = require('http');

/**
 * Proxy an incoming Express request to the configured .NET API and pipe the response back.
 * Uses `process.env.DOTNET_API_HOST` and `process.env.DOTNET_API_PORT` with sensible defaults.
 */
function proxyToDotnet(req, res) {
  const host = process.env.DOTNET_API_HOST || '127.0.0.1';
  const port = parseInt(process.env.DOTNET_API_PORT || '5000', 10);

  const options = {
    hostname: host,
    port: port,
    method: req.method,
    // Forward the original path as-is so .NET routes under /api/v1/* are reachable.
    path: String(req.originalUrl),
    // copy headers but ensure host: header points to target API host:port
    headers: Object.assign({}, req.headers, { host: `${host}:${port}` }),
    timeout: 15000,
  };

  // Ensure tenant header is present for tenant-scoped APIs.
  try {
    // If upstream already set X-Tenant-ID, keep it. Otherwise infer from hostname (subdomain)
    const existingTenant = req.headers['x-tenant-id'] || req.headers['x-tenant-id'.toLowerCase()];
    if (!existingTenant) {
      // hostname may be like 'tenant.buildaq.com' or 'tenant.localhost' (dev)
      const hostHeader = req.hostname || req.headers.host || '';
      const parts = String(hostHeader).split(':')[0].split('.');
      if (parts.length > 2) {
        // take left-most as tenant
        options.headers['x-tenant-id'] = parts[0];
      } else if (parts.length === 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
        // two-part host might be 'tenant.local' or 'tenant.buildaq'
        options.headers['x-tenant-id'] = parts[0];
      }
    }
  } catch (e) {
    // best-effort only
  }

  const proxyReq = http.request(options, (proxyRes) => {
    // Forward status and headers
    res.statusCode = proxyRes.statusCode || 502;
    Object.keys(proxyRes.headers || {}).forEach((h) => {
      // Skip hop-by-hop headers that may cause issues
      if (["connection","keep-alive","transfer-encoding","upgrade","proxy-authorization","proxy-authenticate"].includes(h.toLowerCase())) return;
      res.setHeader(h, proxyRes.headers[h]);
    });

    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy to .NET API error:', err && err.message);
    if (!res.headersSent) res.status(502).json({ error: 'Bad Gateway', message: 'Failed to contact .NET API' });
  });

  // Pipe request body
  req.pipe(proxyReq);
}

function fetchFromDotnet(path, method = 'GET', headers = {}, body = null, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const host = process.env.DOTNET_API_HOST || '127.0.0.1';
    const port = parseInt(process.env.DOTNET_API_PORT || '5000', 10);
    const options = {
      hostname: host,
      port: port,
      method: method,
      path: path,
      headers: Object.assign({}, headers, { host: `${host}:${port}` }),
      timeout: timeoutMs,
    };

    const reqOpt = http.request(options, (proxyRes) => {
      const chunks = [];
      proxyRes.on('data', (c) => chunks.push(c));
      proxyRes.on('end', () => {
        const buf = Buffer.concat(chunks);
        const text = buf.toString('utf8');
        let parsed = null;
        try { parsed = JSON.parse(text); } catch (e) { parsed = text; }
        resolve({ statusCode: proxyRes.statusCode || 0, headers: proxyRes.headers, body: parsed });
      });
    });

    reqOpt.on('error', (err) => reject(err));
    if (body) {
      if (typeof body === 'object') reqOpt.write(JSON.stringify(body)); else reqOpt.write(String(body));
    }
    reqOpt.end();
  });
}

module.exports = {
  proxyToDotnet,
  fetchFromDotnet,
};
