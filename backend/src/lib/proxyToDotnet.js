const http = require('http');

/**
 * Proxy an incoming Express request to the configured .NET API and pipe the response back.
 * Uses `process.env.DOTNET_API_HOST` and `process.env.DOTNET_API_PORT` with sensible defaults.
 */
function proxyToDotnet(req, res) {
  const host = process.env.DOTNET_API_HOST || '127.0.0.1';
  const port = parseInt(process.env.DOTNET_API_PORT || '5000', 10);

  // Parse the original URL into pathname + search so rewrites ignore querystring.
  // This ensures requests like `/api/v1/schools/students?tenantId=default` are
  // rewritten correctly to `/api/users?tenantId=default`.
  let forwardedPath = String(req.originalUrl || '');
  try {
    // Use URL parser with a dummy base so path+search are available
    const tmp = new URL(forwardedPath, 'http://localhost');
    let pathname = tmp.pathname.replace(/\/+/g, '/'); // normalize repeated slashes
    const search = tmp.search || '';

    // rewrite rules for students -> users (target .NET route is /api/users)
    pathname = pathname.replace(/^\/api\/v1\/schools\/students(\/|$)/, '/api/users$1');
    pathname = pathname.replace(/^\/api\/v1\/students(\/|$)/, '/api/users$1');

    forwardedPath = pathname + search;
  } catch (e) {
    // best-effort only; fall back to original string if parsing fails
    forwardedPath = forwardedPath.replace(/\\+/g, '/');
  }

  const options = {
    hostname: host,
    port: port,
    method: req.method,
    // Forward (possibly rewritten) path
    path: forwardedPath,
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
    // Debug original and rewritten path for easier troubleshooting
    console.debug && console.debug(`proxyToDotnet: ${req.method} ${req.originalUrl} -> forwardedPath=${forwardedPath} x-tenant-id=${forwardedTenant} auth=${hasAuth}`);

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

  // We'll create the proxied request when we're ready to send. This lets
  // us set Content-Length (and remove Transfer-Encoding) for requests with
  // bodies so the .NET API does not see a chunked/slow request which can
  // trigger MinRequestBodyDataRate timeouts.
  let proxyReq = null;
  function createProxyReq() {
    // Ensure we don't forward hop-by-hop headers that will confuse the server
    const outgoingHeaders = Object.assign({}, options.headers || {});
    delete outgoingHeaders['transfer-encoding'];
    // Create a shallow copy of options so we can modify headers safely
    const requestOptions = Object.assign({}, options, { headers: outgoingHeaders });

    const r = http.request(requestOptions, (proxyRes) => {
      console.debug && console.debug('proxyToDotnet: received response from dotnet', { statusCode: proxyRes.statusCode, headersCount: proxyRes.headers && Object.keys(proxyRes.headers).length });
      // Forward status and headers
      res.statusCode = proxyRes.statusCode || 502;
      Object.keys(proxyRes.headers || {}).forEach((h) => {
        // Skip hop-by-hop headers that may cause issues
        if (["connection","keep-alive","transfer-encoding","upgrade","proxy-authorization","proxy-authenticate"].includes(h.toLowerCase())) return;
        res.setHeader(h, proxyRes.headers[h]);
      });

      proxyRes.pipe(res, { end: true });
    });

    r.on('error', (err) => {
      console.error('Proxy to .NET API error:', err && err.message);
      if (!res.headersSent) res.status(502).json({ error: 'Bad Gateway', message: 'Failed to contact .NET API' });
    });

    r.on('timeout', () => {
      console.error('proxyToDotnet: proxy request timed out');
      try { r.abort(); } catch (e) {}
      if (!res.headersSent) res.status(504).json({ error: 'Gateway Timeout', message: 'Request to .NET API timed out' });
    });

    return r;
  }

  // Pipe or buffer request body.
  // Some clients (PowerShell, dev proxies) may send bodies slowly or chunked
  // which can trigger Kestrel's MinRequestBodyDataRate. To avoid timeouts,
  // buffer the body for methods that typically include a payload and then
  // send it with a Content-Length header so the server reads it deterministically.
  const methodsWithBody = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (methodsWithBody.includes(String(req.method).toUpperCase())) {
    const chunks = [];
    let finished = false;
    const readTimeoutMs = parseInt(process.env.DEV_PROXY_READ_TIMEOUT_MS || '15000', 10) || 15000;
    const readTimer = setTimeout(() => {
      if (!finished) {
        console.error('proxyToDotnet: timeout waiting for incoming request body');
        if (!res.headersSent) {
          try { res.status(408).json({ error: 'Request Timeout', message: 'Timed out reading request body' }); } catch (e) {}
        }
      }
    }, readTimeoutMs);

    // Helper: create outgoing request and send a buffered body
    const sendBuffered = (bodyBuf) => {
      try {
        clearTimeout(readTimer);
        finished = true;
        bodyBuf = bodyBuf || Buffer.alloc(0);
        console.debug && console.debug('proxyToDotnet: sending buffered body bytes=', bodyBuf.length);

        const outHeaders = Object.assign({}, options.headers || {});
        delete outHeaders['transfer-encoding'];
        if (!outHeaders['content-length']) outHeaders['content-length'] = String(bodyBuf.length);

        const proxyReq2 = http.request(Object.assign({}, options, { headers: outHeaders }), (proxyRes) => {
          console.debug && console.debug('proxyToDotnet: received response from dotnet', { statusCode: proxyRes.statusCode, headersCount: proxyRes.headers && Object.keys(proxyRes.headers).length });
          res.statusCode = proxyRes.statusCode || 502;
          Object.keys(proxyRes.headers || {}).forEach((h) => {
            if (["connection","keep-alive","transfer-encoding","upgrade","proxy-authorization","proxy-authenticate"].includes(h.toLowerCase())) return;
            res.setHeader(h, proxyRes.headers[h]);
          });
          proxyRes.pipe(res, { end: true });
        });

        proxyReq2.on('error', (err) => {
          console.error('Proxy to .NET API error:', err && err.message);
          if (!res.headersSent) res.status(502).json({ error: 'Bad Gateway', message: 'Failed to contact .NET API' });
        });

        if (bodyBuf.length > 0) proxyReq2.write(bodyBuf);
        proxyReq2.end();
      } catch (e) {
        console.error('Error sending buffered request body:', e && e.message);
        try { if (!res.headersSent) res.status(500).json({ error: 'Proxy Error', message: 'Failed to buffer and forward request body' }); } catch (e) {}
      }
    };

    // If body was parsed by earlier middleware (express.json / urlencoded), use it
    try {
      if (req.body !== undefined) {
        let bodyBuf;
        if (Buffer.isBuffer(req.body)) bodyBuf = req.body;
        else if (typeof req.body === 'object') bodyBuf = Buffer.from(JSON.stringify(req.body));
        else bodyBuf = Buffer.from(String(req.body));
        return sendBuffered(bodyBuf);
      }
    } catch (e) {
      // fall through to streaming/collecting below
    }

    // If the stream has already ended (no data events will fire), send empty body
    if (req.readableEnded) {
      return sendBuffered(Buffer.alloc(0));
    }

    req.on('data', (c) => {
      try { chunks.push(Buffer.from(c)); } catch (e) {}
    });
    req.on('end', () => {
      finished = true;
      clearTimeout(readTimer);
      try {
        const bodyBuf = Buffer.concat(chunks);
        return sendBuffered(bodyBuf);
      } catch (e) {
        console.error('Error buffering request body for proxy:', e && e.message);
        try { if (!res.headersSent) res.status(500).json({ error: 'Proxy Error', message: 'Failed to buffer and forward request body' }); } catch (e) {}
      }
    });
    req.on('error', (err) => {
      finished = true;
      clearTimeout(readTimer);
      console.error('Error reading incoming request body:', err && err.message);
      try { if (!res.headersSent) res.status(500).json({ error: 'Proxy Read Error' }); } catch (e) {}
    });
  } else {
    // Methods without a body — create outgoing request and stream directly
    // Remove transfer-encoding to avoid conflicting hop-by-hop headers
    const outHeaders = Object.assign({}, options.headers || {});
    delete outHeaders['transfer-encoding'];
    const proxyReqNoBody = http.request(Object.assign({}, options, { headers: outHeaders }), (proxyRes) => {
      console.debug && console.debug('proxyToDotnet: received response from dotnet', { statusCode: proxyRes.statusCode, headersCount: proxyRes.headers && Object.keys(proxyRes.headers).length });
      res.statusCode = proxyRes.statusCode || 502;
      Object.keys(proxyRes.headers || {}).forEach((h) => {
        if (["connection","keep-alive","transfer-encoding","upgrade","proxy-authorization","proxy-authenticate"].includes(h.toLowerCase())) return;
        res.setHeader(h, proxyRes.headers[h]);
      });
      proxyRes.pipe(res, { end: true });
    });

    proxyReqNoBody.on('error', (err) => {
      console.error('Proxy to .NET API error:', err && err.message);
      if (!res.headersSent) res.status(502).json({ error: 'Bad Gateway', message: 'Failed to contact .NET API' });
    });

    req.pipe(proxyReqNoBody);
  }
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
