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
    // Normalize path: frontend and backend use /api/v1/* but the .NET API
    // controllers are mounted at /api/* (no v1). Strip a leading /api/v1 -> /api
    path: String(req.originalUrl).replace(/^\/api\/v1(\/|$)/, '/api$1'),
    headers: Object.assign({}, req.headers, { host: `${host}:${port}` }),
    timeout: 15000,
  };

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
