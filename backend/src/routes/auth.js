const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const database = require('../config/database');

// Simple authentication route. In production this should delegate to
// a proper identity provider (OIDC/OAuth2) and perform secure credential checks.
// This implementation will: if a real database connection exists, validate
// the user against the `users` table using bcrypt; otherwise fall back to
// a permissive dev-mode behavior for local development.

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TOKEN_TTL = process.env.JWT_TTL_SECONDS ? parseInt(process.env.JWT_TTL_SECONDS, 10) : 60 * 60 * 8; // 8 hours
// For safety, dev fallback behavior (auto-issuing tokens when DB is not available)
// must be explicitly enabled. Set ALLOW_DEV_FALLBACK=true in your env to allow it.
const ALLOW_DEV_FALLBACK = String(process.env.ALLOW_DEV_FALLBACK || '').toLowerCase() === 'true';
// For safer dev fallback, require an explicit secret to be provided via DEV_FALLBACK_SECRET.
// When set, local dev clients must present this value as the password to obtain a token
// when the DB is not available. This prevents arbitrary credentials from working.
const DEV_FALLBACK_SECRET = process.env.DEV_FALLBACK_SECRET || null;

router.post('/login', async (req, res) => {
  const { username, password, tenant } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  // If the database is connected and not using the mock driver, validate against users table
  let attemptedDbAuth = false;
  try {
    if (database && database.isConnected && database.isConnected() && database.type && database.type.toLowerCase() !== 'mock') {
      const dbConn = database.getConnection();

      // Use parameterized query depending on driver
      let userRow = null;
      if (database.type.toLowerCase() === 'postgresql') {
        const result = await dbConn.query(
          'SELECT u.id, u.email, u.password_hash, t.domain as tenant_domain, t.id as tenant_id FROM users u JOIN tenants t ON u.tenant_id = t.id WHERE u.email = $1 LIMIT 1',
          [username]
        );
        userRow = result && result.rows && result.rows[0];
      } else if (database.type.toLowerCase() === 'mysql') {
        const [rows] = await dbConn.execute(
          'SELECT u.id, u.email, u.password_hash, t.domain as tenant_domain, t.id as tenant_id FROM users u JOIN tenants t ON u.tenant_id = t.id WHERE u.email = ? LIMIT 1',
          [username]
        );
        userRow = rows && rows[0];
      } else if (database.type.toLowerCase() === 'sqlite') {
        const rows = await dbConn.all(
          'SELECT u.id, u.email, u.password_hash, t.domain as tenant_domain, t.id as tenant_id FROM users u JOIN tenants t ON u.tenant_id = t.id WHERE u.email = ? LIMIT 1',
          [username]
        );
        userRow = rows && rows[0];
      }

      attemptedDbAuth = true;
      if (!userRow) {
        return res.status(401).json({ error: 'invalid credentials' });
      }

      const hash = userRow.password_hash || userRow.password || '';
      const match = await bcrypt.compare(password, hash);
      if (!match) {
        return res.status(401).json({ error: 'invalid credentials' });
      }

      const tenantId = tenant || userRow.tenant_domain || userRow.tenant_id;
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        sub: userRow.email,
        tenant: tenantId,
        iat: now,
        exp: now + TOKEN_TTL,
      };

      const token = jwt.sign(payload, JWT_SECRET);
      return res.json({ token, expiresIn: TOKEN_TTL, tenant: tenantId });
    }
  } catch (err) {
    console.error('Auth DB lookup error:', err);
    // If DB lookup fails, only fall back to dev behavior when explicitly allowed.
    if (!ALLOW_DEV_FALLBACK) {
      return res.status(500).json({ error: 'authentication unavailable: database error' });
    }
  }
  // Fallback: dev-friendly behavior (preserves previous behavior when no DB connected)
  if (!ALLOW_DEV_FALLBACK && !attemptedDbAuth) {
    // DB was not used and dev fallback is disabled — fail fast so we don't accidentally
    // issue tokens when the DB is unreachable.
    return res.status(503).json({ error: 'authentication unavailable (DB not connected)' });
  }

  const tenantId = tenant || (req.hostname ? (String(req.hostname).split('.')[0] || '') : '');
  if (!tenantId) return res.status(400).json({ error: 'tenant is required (provide in request or use subdomain)' });

  // Dev fallback safety: require explicit enablement AND a fallback secret.
  if (!ALLOW_DEV_FALLBACK) {
    return res.status(503).json({ error: 'authentication unavailable (dev fallback disabled)' });
  }

  if (!DEV_FALLBACK_SECRET) {
    // If ALLOW_DEV_FALLBACK is true but no secret is set, refuse to issue tokens.
    console.warn('ALLOW_DEV_FALLBACK is enabled but DEV_FALLBACK_SECRET is not set — refusing fallback login');
    return res.status(503).json({ error: 'authentication unavailable (dev fallback not configured)' });
  }

  // Require the client to present the DEV_FALLBACK_SECRET as the password to obtain a token.
  if (password !== DEV_FALLBACK_SECRET) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

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