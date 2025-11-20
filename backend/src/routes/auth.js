const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Simple dev authentication route. In production this should delegate to
// a proper identity provider (OIDC/OAuth2) and perform secure credential checks.
// Request: { username, password, tenant }

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TOKEN_TTL = process.env.JWT_TTL_SECONDS ? parseInt(process.env.JWT_TTL_SECONDS, 10) : 60 * 60 * 8; // 8 hours

router.post('/login', (req, res) => {
  const { username, password, tenant } = req.body || {};

  // Very small dev-friendly validation
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  // In dev mode accept any credential but ensure tenant is provided (or inferred)
  const tenantId = tenant || (req.hostname ? (String(req.hostname).split('.')[0] || '') : '');
  if (!tenantId) return res.status(400).json({ error: 'tenant is required (provide in request or use subdomain)' });

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: username,
    tenant: tenantId,
    iat: now,
    exp: now + TOKEN_TTL,
  };

  const token = jwt.sign(payload, JWT_SECRET);

  return res.json({ token, expiresIn: TOKEN_TTL, tenant: tenantId });
});

// Simple token introspect for shell to check login status
router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' });
  const token = auth.slice('Bearer '.length);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ user: decoded.sub, tenant: decoded.tenant, exp: decoded.exp });
  } catch (err) {
    return res.status(401).json({ error: 'invalid token', message: err.message });
  }
});

  module.exports = router;