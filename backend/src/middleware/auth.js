const jwt = require('jsonwebtoken');
const database = require('../config/database');

/**
 * Authentication middleware
 * Verifies JWT token and adds user info to request
 */
const authMiddleware = async (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      error: 'No token provided',
      message: 'Access denied. Please provide a valid authentication token.'
    });
  }

  try {
    // Verify token
    const secretKey = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secretKey);

    // Add user info to request
    req.user = decoded;

    // Resolve tenant: prefer header, then token value, then host lookup
    let tenantIdentifier = req.header('X-Tenant-ID') || decoded.tenant || decoded.tenantId || null;

    // If tenantIdentifier looks like a domain (contains a dot) or missing, try lookup by host
    if (!tenantIdentifier || String(tenantIdentifier).indexOf('.') !== -1) {
      const hostHeader = (req.headers.host || req.hostname || '').split(':')[0];
      const lookupDomain = tenantIdentifier && String(tenantIdentifier).indexOf('.') !== -1 ? String(tenantIdentifier) : hostHeader;

      if (lookupDomain) {
        try {
          if (database && database.isConnected && database.isConnected()) {
            // Query tenants table for exact domain match
            const result = await database.query('SELECT id, domain, name FROM public.tenants WHERE domain = $1 LIMIT 1', [lookupDomain]);
            const tenantRow = result && result[0];
            if (tenantRow) {
              req.tenant = { id: tenantRow.id, domain: tenantRow.domain, name: tenantRow.name };
              req.tenantId = tenantRow.id;
            }
          }
        } catch (err) {
          console.error('Tenant lookup error:', err.message || err);
        }
      }
    }

    // If still no tenantId, and tenantIdentifier is numeric, set it
    if (!req.tenantId && tenantIdentifier) {
      const asNum = Number(tenantIdentifier);
      if (!Number.isNaN(asNum)) {
        req.tenantId = asNum;
      } else if (!req.tenantId) {
        // tenantIdentifier may be a domain string; try lookup one more time without throwing
        try {
          if (database && database.isConnected && database.isConnected()) {
            const result2 = await database.query('SELECT id, domain, name FROM public.tenants WHERE domain = $1 LIMIT 1', [tenantIdentifier]);
            const t2 = result2 && result2[0];
            if (t2) {
              req.tenant = { id: t2.id, domain: t2.domain, name: t2.name };
              req.tenantId = t2.id;
            }
          }
        } catch (err) {
          // ignore
        }
      }
    }

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid.'
      });
    }

    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Token verification failed.'
    });
  }
};

/**
 * Optional authentication middleware
 * Same as authMiddleware but doesn't fail if no token is provided
 */
const optionalAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next();
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;

    // Attempt same tenant resolution as authMiddleware, but don't fail if it errors
    try {
      let tenantIdentifier = req.header('X-Tenant-ID') || decoded.tenant || decoded.tenantId || null;
      if (!tenantIdentifier || String(tenantIdentifier).indexOf('.') !== -1) {
        const hostHeader = (req.headers.host || req.hostname || '').split(':')[0];
        const lookupDomain = tenantIdentifier && String(tenantIdentifier).indexOf('.') !== -1 ? String(tenantIdentifier) : hostHeader;
        if (lookupDomain && database && database.isConnected && database.isConnected()) {
          const result = await database.query('SELECT id, domain, name FROM public.tenants WHERE domain = $1 LIMIT 1', [lookupDomain]);
          const tenantRow = result && result[0];
          if (tenantRow) {
            req.tenant = { id: tenantRow.id, domain: tenantRow.domain, name: tenantRow.name };
            req.tenantId = tenantRow.id;
          }
        }
      }
      if (!req.tenantId && tenantIdentifier) {
        const asNum = Number(tenantIdentifier);
        if (!Number.isNaN(asNum)) req.tenantId = asNum;
      }
    } catch (err) {
      console.log('Optional tenant lookup failed:', err.message || err);
    }
  } catch (error) {
    console.log('Optional auth failed:', error.message);
    // Don't fail, just continue without user info
  }

  next();
};

/**
 * Role-based authorization middleware
 * Checks if user has required role
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource.'
      });
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Access denied. Required roles: ${requiredRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Tenant isolation middleware
 * Ensures users can only access data from their tenant
 */
const requireTenant = (req, res, next) => {
  // Prefer tenant resolved earlier on the request (auth middleware),
  // then X-Tenant-ID header, then token-based tenant id
  const tenantId = req.tenantId || req.header('X-Tenant-ID') || req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({
      error: 'Tenant ID required',
      message: 'Please provide a valid tenant ID in the X-Tenant-ID header or authenticate to infer tenant from the Host.'
    });
  }

  req.tenantId = Number(tenantId);
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  requireRole,
  requireTenant
};