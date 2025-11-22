const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const classRoutes = require('./routes/classes');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const remotesRoute = require('./routes/remotes');
const tenantRoutes = require('./routes/tenants');
const enrollmentsRoutes = require('./routes/enrollments');
const departmentsRoutes = require('./routes/departments');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authMiddleware, optionalAuth } = require('./middleware/auth');

// Import database connection
const database = require('./config/database');

const app = express();
// Disable ETag to avoid conditional 304 Not Modified responses during local dev
app.disable('etag');
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting (important for deployed environments)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
// Parse and normalize comma-separated origins from multiple possible env vars.
// Support `CORS_ORIGIN`, `ALLOWED_ORIGINS`, or `DEV_ALLOWED_ORIGINS` (script may set one of these).
const rawCors = (process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || process.env.DEV_ALLOWED_ORIGINS || '');
const allowedOrigins = rawCors.split(',').map(s => s.trim()).filter(Boolean);
if (allowedOrigins.length === 0) {
  // default for development when nothing provided
  allowedOrigins.push('http://localhost:4200');
}
// Deduplicate
const uniqAllowed = [...new Set(allowedOrigins)];
console.log('🔐 CORS allowed origins:', uniqAllowed.join(', '));

const corsOptions = {
  origin: function (origin, callback) {
    // If no origin (e.g., server-to-server or same-origin), allow
    if (!origin) return callback(null, true);
    // Allow wildcard
    if (uniqAllowed.indexOf('*') !== -1) return callback(null, true);
    // Exact match required for security; trim incoming origin just in case
    const trimmed = String(origin).trim();
    if (uniqAllowed.indexOf(trimmed) !== -1) return callback(null, true);
    // Support wildcard subdomain entries like `*.buildaq.com` in the allowed list
    const originHost = (() => {
      try { return new URL(trimmed).hostname; } catch (e) { return trimmed; }
    })();
    for (const allowed of uniqAllowed) {
      if (allowed.indexOf('*') !== -1) {
        // convert '*.domain.com' -> check endsWith 'domain.com'
        const tail = allowed.replace('*.', '');
        if (originHost.endsWith(tail)) return callback(null, true);
      }
    }
    // Not allowed - signal CORS module to not set allow header (do not throw)
    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
  const logFormat = process.env.NODE_ENV === 'production' 
    ? 'combined' 
    : 'dev';
  app.use(morgan(logFormat));
}

// API Documentation (Swagger)
if (process.env.ENABLE_SWAGGER_DOCS === 'true') {
  const swaggerJsDoc = require('swagger-jsdoc');
  const swaggerUi = require('swagger-ui-express');
  
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'School Management API',
        version: '1.0.0',
        description: 'API for School Management System',
        contact: {
          name: 'BuildAQ Team',
          url: 'https://buildaq.com',
        },
      },
      servers: [
        {
          url: process.env.API_BASE_URL || 'http://localhost:3000/api',
          description: 'Development server',
        },
        {
          url: 'https://your-api.azurewebsites.net/api',
          description: 'Production server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ['./src/routes/*.js'], // Path to the API files
  };

  const swaggerSpec = swaggerJsDoc(swaggerOptions);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Health check route (no authentication required)
// Make API responses non-cacheable in dev to avoid 304 responses which return
// no body and can confuse XHR clients during iterative development.
app.use('/api/', (req, res, next) => {
  // Only set no-store for local/dev environment
  if ((process.env.NODE_ENV || 'development') === 'development') {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// Serve remotes registry for module federation (mounted at /assets/remotes.json)
app.use('/api/health', healthRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// Tenant provisioning routes (public)
app.use('/api/tenants', tenantRoutes);

// Serve remotes registry for module federation (mounted at /assets/remotes.json)
// This allows the frontend shell to fetch a dev-friendly mapping of remotes.
app.use('/assets', remotesRoute);

// Protected API routes
// In development, allow optional authentication for classes and teachers so the frontend
// can call the endpoints during local dev without a token. Production still
// requires authentication.
const classesAuth = process.env.NODE_ENV === 'development' ? optionalAuth : authMiddleware;
const teachersAuth = process.env.NODE_ENV === 'development' ? optionalAuth : authMiddleware;
app.use('/api/v1/students', authMiddleware, studentRoutes);
// Require authentication for teachers/classes/enrollments so tenant is resolved from token
app.use('/api/v1/teachers', authMiddleware, teacherRoutes);
app.use('/api/v1/classes', authMiddleware, classRoutes);
// Enrollments: require auth to ensure tenant resolution matches other routes
app.use('/api/v1/enrollments', authMiddleware, enrollmentsRoutes);
const departmentsAuth = process.env.NODE_ENV === 'development' ? optionalAuth : authMiddleware;
app.use('/api/v1/departments', departmentsAuth, departmentsRoutes);

// Backwards-compatible alias routes under /api/v1/schools/* used by the
// front-end remote. For the alias routes we require authentication so the
// tenant is always resolved from the token (matches `/api/v1/students` behavior).
app.use('/api/v1/schools/students', authMiddleware, studentRoutes);
app.use('/api/v1/schools/teachers', authMiddleware, teacherRoutes);
app.use('/api/v1/schools/classes', authMiddleware, classRoutes);
app.use('/api/v1/schools/departments', authMiddleware, departmentsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'School Management API',
    version: process.env.API_VERSION || 'v1',
    status: 'running',
    documentation: process.env.ENABLE_SWAGGER_DOCS === 'true' ? '/api/docs' : 'disabled',
    health: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      '/api/health',
      '/api/auth',
      '/api/v1/students',
      '/api/v1/teachers',
      '/api/v1/classes',
    ],
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Initialize database connection
database.connect()
  .then(() => {
    console.log('✅ Database connected successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 School Management API v${process.env.API_VERSION || '1'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📖 API Documentation: ${process.env.ENABLE_SWAGGER_DOCS === 'true' ? `http://localhost:${PORT}/api/docs` : 'disabled'}`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('\n🔧 Development mode enabled');
        console.log('   - Request logging enabled');
        console.log('   - Detailed error messages enabled');
        console.log('   - CORS enabled for localhost:4200');
      }
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to database:', error.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  database.disconnect();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  database.disconnect();
  process.exit(0);
});

module.exports = app;