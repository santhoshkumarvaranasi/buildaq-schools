const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Verifies JWT token and adds user info to request
 */
const authMiddleware = (req, res, next) => {
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
    
    // Add tenant info if available
    req.tenantId = req.header('X-Tenant-ID') || decoded.tenantId;
    
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
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next();
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    req.tenantId = req.header('X-Tenant-ID') || decoded.tenantId;
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
  const tenantId = req.header('X-Tenant-ID') || req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({
      error: 'Tenant ID required',
      message: 'Please provide a valid tenant ID in the X-Tenant-ID header.'
    });
  }

  req.tenantId = tenantId;
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  requireRole,
  requireTenant
};