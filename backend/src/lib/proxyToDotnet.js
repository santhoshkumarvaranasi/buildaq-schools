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
    const existingTenant = req.get && (req.get('X-Tenant-ID') || req.get('x-tenant-id')) || req.headers['x-tenant-id'];
    if (!existingTenant) {
      // Developer-friendly fallback: if a query parameter `tenantId` is present
      // use that as the tenant header (only in development). This helps local
      // shell/remote calls that include `?tenantId=...` to be routed correctly
      // when Authorization is not present.
      try {
        if ((process.env.NODE_ENV || 'development') === 'development' && req.query && req.query.tenantId) {
          options.headers['x-tenant-id'] = req.query.tenantId;
          console.debug && console.debug(`proxyToDotnet: using tenant from query param -> ${req.query.tenantId}`);
        } else {
          // hostname may be like 'tenant.buildaq.com' or 'tenant.localhost' (dev)
          const hostHeader = req.hostname || req.headers.host || '';
          // remove port and split by dot
          const hostOnly = String(hostHeader).split(':')[0];
          const parts = hostOnly.split('.').filter(Boolean);
          // Only infer a tenant subdomain when the left-most part is non-numeric and not localhost
          const candidate = parts[0];
          const isNumeric = /^[0-9]+$/.test(candidate || '');
          if (!isNumeric && candidate && candidate !== 'localhost' && candidate !== 'www' && parts.length >= 2) {
            options.headers['x-tenant-id'] = candidate;
          }
        }
      } catch (e) {
        // best-effort only
      }
    } else {
      // preserve whatever upstream provided (usually a numeric id)
      options.headers['x-tenant-id'] = existingTenant;
    }
  } catch (e) {
    // best-effort only
  }

  // Add helpful debug output so requests can be traced during dev
  try {
    const forwardedTenant = options.headers['x-tenant-id'] || '(none)';
    const hasAuth = !!(req.get && req.get('Authorization')) || !!req.headers.authorization;
    console.debug && console.debug(`proxyToDotnet: ${req.method} ${req.originalUrl} -> x-tenant-id=${forwardedTenant} auth=${hasAuth}`);

    // Dev-only: if requested via query param or env var, dump sanitized forwarded headers
    // Usage: add `?_dumpHeaders=1` to the request URL or set `ENABLE_PROXY_HEADER_DUMP=true` in env
    const shouldDump = (process.env.ENABLE_PROXY_HEADER_DUMP === 'true') || (req.query && String(req.query._dumpHeaders) === '1');
    if (shouldDump) {
      try {
        // Create shallow copy of headers we're about to forward and redact sensitive keys
        const headersCopy = Object.assign({}, options.headers || {});
        const redact = (v) => (v ? 'REDACTED' : v);
        const sensitive = ['authorization', 'cookie', 'set-cookie', 'x-api-key', 'proxy-authorization'];
        for (const k of Object.keys(headersCopy)) {
          if (sensitive.includes(k.toLowerCase())) {
            headersCopy[k] = redact(headersCopy[k]);
          }
        }
        // Also include original incoming headers (sanitized) for comparison
        const incoming = Object.assign({}, req.headers || {});
        for (const k of Object.keys(incoming)) {
          if (sensitive.includes(k.toLowerCase())) incoming[k] = redact(incoming[k]);
        }
        console.debug && console.debug('proxyToDotnet: forwarded-headers (sanitized):', JSON.stringify(headersCopy, null, 2));
        console.debug && console.debug('proxyToDotnet: incoming-headers (sanitized):', JSON.stringify(incoming, null, 2));
      } catch (e) {
        // ignore logging failures
      }
    }
  } catch (e) {
    // ignore logging failures
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
