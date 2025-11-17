const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const dns = require('dns').promises;
const validator = require('validator');

const router = express.Router();

// Mock databases - replace with your actual database
const tenantRegistry = new Map(); // Central tenant registry
const tenantDatabases = new Map(); // Per-tenant database connections

/**
 * Create a new tenant (school)
 * POST /api/tenants/provision
 */
router.post('/provision', async (req, res) => {
  try {
    const {
      schoolName,
      tenantId,
      adminEmail,
      adminName,
      adminPassword,
      phone,
      plan = 'trial',
      customDomain,
      features = {},
      branding = {},
      settings = {}
    } = req.body;

    // Validation
    const validation = validateTenantProvisioningData(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Check if tenant already exists
    if (tenantRegistry.has(tenantId)) {
      return res.status(409).json({
        success: false,
        message: 'Tenant already exists',
        error: 'TENANT_EXISTS'
      });
    }

    // Check subdomain availability
    const subdomainAvailable = await checkSubdomainAvailability(tenantId);
    if (!subdomainAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Subdomain not available',
        error: 'SUBDOMAIN_UNAVAILABLE'
      });
    }

    // Generate tenant configuration
    const tenantConfig = await generateTenantConfiguration({
      schoolName,
      tenantId,
      adminEmail,
      adminName,
      adminPassword,
      phone,
      plan,
      customDomain,
      features,
      branding,
      settings
    });

    // Create tenant database
    await createTenantDatabase(tenantConfig);

    // Register tenant
    tenantRegistry.set(tenantId, tenantConfig);

    // Setup DNS (in production, integrate with your DNS provider)
    await setupDNSRecords(tenantId, customDomain);

    // Generate admin user token
    const adminToken = jwt.sign(
      { 
        tenantId: tenantId, 
        userId: tenantConfig.adminUserId, 
        role: 'admin',
        email: adminEmail 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Tenant provisioned successfully',
      data: {
        tenantId: tenantConfig.id,
        domain: tenantConfig.domain,
        customDomain: tenantConfig.customDomain,
        adminToken,
        loginUrl: `https://${tenantConfig.domain}.buildaq.com/login`,
        dashboardUrl: `https://${tenantConfig.domain}.buildaq.com/dashboard`,
        status: tenantConfig.status,
        subscription: {
          plan: tenantConfig.subscription.plan,
          trialEndsAt: tenantConfig.subscription.trialEndsAt
        }
      }
    });

  } catch (error) {
    console.error('Tenant provisioning failed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during tenant provisioning',
      error: error.message
    });
  }
});

/**
 * Get tenant information
 * GET /api/tenants/:tenantId
 */
router.get('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const tenant = tenantRegistry.get(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
        error: 'TENANT_NOT_FOUND'
      });
    }

    // Remove sensitive information before sending
    const sanitizedTenant = sanitizeTenantData(tenant);

    res.json({
      success: true,
      data: sanitizedTenant
    });

  } catch (error) {
    console.error('Failed to retrieve tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Update tenant configuration
 * PUT /api/tenants/:tenantId
 */
router.put('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const updates = req.body;

    const tenant = tenantRegistry.get(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Validate updates
    const validation = validateTenantUpdates(updates);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Apply updates
    const updatedTenant = {
      ...tenant,
      ...updates,
      updatedAt: new Date()
    };

    tenantRegistry.set(tenantId, updatedTenant);

    // Update tenant database if needed
    if (updates.databaseConfig) {
      await updateTenantDatabase(tenantId, updates.databaseConfig);
    }

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: sanitizeTenantData(updatedTenant)
    });

  } catch (error) {
    console.error('Failed to update tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Delete/suspend tenant
 * DELETE /api/tenants/:tenantId
 */
router.delete('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { permanent = false } = req.query;

    const tenant = tenantRegistry.get(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    if (permanent) {
      // Permanently delete tenant and data
      await deleteTenantDatabase(tenantId);
      await removeDNSRecords(tenantId);
      tenantRegistry.delete(tenantId);
      
      res.json({
        success: true,
        message: 'Tenant permanently deleted'
      });
    } else {
      // Suspend tenant
      tenant.status = 'suspended';
      tenant.suspendedAt = new Date();
      tenantRegistry.set(tenantId, tenant);
      
      res.json({
        success: true,
        message: 'Tenant suspended'
      });
    }

  } catch (error) {
    console.error('Failed to delete/suspend tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * List all tenants (admin only)
 * GET /api/tenants
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, plan, search } = req.query;
    
    let tenants = Array.from(tenantRegistry.values());

    // Apply filters
    if (status) {
      tenants = tenants.filter(t => t.status === status);
    }
    if (plan) {
      tenants = tenants.filter(t => t.subscription.plan === plan);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      tenants = tenants.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.displayName.toLowerCase().includes(searchLower) ||
        t.domain.toLowerCase().includes(searchLower) ||
        t.adminEmail.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTenants = tenants.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedTenants.map(sanitizeTenantData),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: tenants.length,
        totalPages: Math.ceil(tenants.length / limit)
      }
    });

  } catch (error) {
    console.error('Failed to list tenants:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Check domain availability
 * GET /api/tenants/check-availability/:domain
 */
router.get('/check-availability/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    // Validate domain format
    if (!isValidDomainName(domain)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid domain format'
      });
    }

    const available = await checkSubdomainAvailability(domain);
    
    res.json({
      success: true,
      data: {
        domain,
        available,
        suggestedAlternatives: available ? [] : generateDomainAlternatives(domain)
      }
    });

  } catch (error) {
    console.error('Failed to check domain availability:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Helper Functions

/**
 * Validate tenant provisioning data
 */
function validateTenantProvisioningData(data) {
  const errors = [];

  if (!data.schoolName || data.schoolName.trim().length < 3) {
    errors.push('School name must be at least 3 characters long');
  }

  if (!data.tenantId || !isValidDomainName(data.tenantId)) {
    errors.push('Invalid tenant ID. Must be a valid domain name format');
  }

  if (!data.adminEmail || !validator.isEmail(data.adminEmail)) {
    errors.push('Valid admin email is required');
  }

  if (!data.adminName || data.adminName.trim().length < 2) {
    errors.push('Admin name must be at least 2 characters long');
  }

  if (!data.adminPassword || data.adminPassword.length < 8) {
    errors.push('Admin password must be at least 8 characters long');
  }

  if (data.phone && !validator.isMobilePhone(data.phone)) {
    errors.push('Invalid phone number format');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate tenant updates
 */
function validateTenantUpdates(updates) {
  const errors = [];

  if (updates.adminEmail && !validator.isEmail(updates.adminEmail)) {
    errors.push('Invalid email format');
  }

  if (updates.customDomain && !validator.isFQDN(updates.customDomain)) {
    errors.push('Invalid custom domain format');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate tenant configuration
 */
async function generateTenantConfiguration(data) {
  const tenantId = uuidv4();
  const adminUserId = uuidv4();
  const hashedPassword = await bcrypt.hash(data.adminPassword, 12);

  return {
    id: data.tenantId,
    uuid: tenantId,
    name: data.tenantId,
    displayName: data.schoolName,
    description: `${data.schoolName} School Management System`,
    domain: data.tenantId,
    customDomain: data.customDomain || null,
    status: 'active',

    // Admin info
    adminUserId,
    adminEmail: data.adminEmail,
    adminName: data.adminName,
    adminPasswordHash: hashedPassword,
    adminPhone: data.phone,

    // Features based on plan
    features: generateFeaturesForPlan(data.plan, data.features),
    
    // Branding
    branding: {
      logo: data.branding.logo || '',
      favicon: data.branding.favicon || '/favicon.ico',
      primaryColor: data.branding.primaryColor || '#3498db',
      secondaryColor: data.branding.secondaryColor || '#2ecc71',
      accentColor: data.branding.accentColor || '#f39c12',
      logoUrl: data.branding.logoUrl || '',
      backgroundImage: data.branding.backgroundImage || null,
      fontFamily: data.branding.fontFamily || 'Inter, sans-serif'
    },

    // Settings
    settings: {
      timezone: data.settings.timezone || 'America/New_York',
      dateFormat: data.settings.dateFormat || 'MM/DD/YYYY',
      timeFormat: data.settings.timeFormat || '12h',
      currency: data.settings.currency || 'USD',
      language: data.settings.language || 'en-US',
      academicYear: data.settings.academicYear || {
        start: '2025-08-15',
        end: '2026-06-15'
      },
      gradingScale: data.settings.gradingScale || {
        'A': 90, 'B': 80, 'C': 70, 'D': 60, 'F': 0
      },
      classPeriods: data.settings.classPeriods || {
        '1': '08:00-08:50', '2': '09:00-09:50', '3': '10:00-10:50',
        '4': '11:00-11:50', '5': '12:00-12:50', '6': '13:00-13:50',
        '7': '14:00-14:50', '8': '15:00-15:50'
      },
      schoolHours: data.settings.schoolHours || {
        start: '07:30',
        end: '16:00'
      }
    },

    // Subscription
    subscription: generateSubscriptionForPlan(data.plan),

    // Metadata
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,

    // Compliance
    dataRegion: process.env.DEFAULT_DATA_REGION || 'US-East',
    complianceLevel: 'ferpa',
    ssoEnabled: false,
    mfaRequired: data.plan === 'enterprise',

    // Database configuration
    databaseConfig: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      username: `tenant_${data.tenantId}`,
      password: generateRandomPassword(),
      database: `school_${data.tenantId}`,
      schema: 'public'
    }
  };
}

/**
 * Generate features based on subscription plan
 */
function generateFeaturesForPlan(plan, customFeatures = {}) {
  const planFeatures = {
    free: {
      gradebook: true,
      reports: false,
      analytics: false,
      bulkOperations: false,
      dataExport: false,
      realTimeUpdates: false,
      notifications: true,
      customBranding: false,
      apiAccess: false,
      advancedReporting: false
    },
    trial: {
      gradebook: true,
      reports: true,
      analytics: true,
      bulkOperations: true,
      dataExport: true,
      realTimeUpdates: true,
      notifications: true,
      customBranding: true,
      apiAccess: true,
      advancedReporting: true
    },
    basic: {
      gradebook: true,
      reports: true,
      analytics: false,
      bulkOperations: true,
      dataExport: true,
      realTimeUpdates: true,
      notifications: true,
      customBranding: false,
      apiAccess: false,
      advancedReporting: false
    },
    premium: {
      gradebook: true,
      reports: true,
      analytics: true,
      bulkOperations: true,
      dataExport: true,
      realTimeUpdates: true,
      notifications: true,
      customBranding: true,
      apiAccess: true,
      advancedReporting: true
    },
    enterprise: {
      gradebook: true,
      reports: true,
      analytics: true,
      bulkOperations: true,
      dataExport: true,
      realTimeUpdates: true,
      notifications: true,
      customBranding: true,
      apiAccess: true,
      advancedReporting: true
    }
  };

  return { ...planFeatures[plan] || planFeatures.free, ...customFeatures };
}

/**
 * Generate subscription configuration for plan
 */
function generateSubscriptionForPlan(plan) {
  const planLimits = {
    free: { maxStudents: 50, maxTeachers: 5, maxClasses: 10, maxStorageGB: 1, maxApiCalls: 1000 },
    trial: { maxStudents: 1000, maxTeachers: 100, maxClasses: 200, maxStorageGB: 10, maxApiCalls: 10000 },
    basic: { maxStudents: 200, maxTeachers: 20, maxClasses: 50, maxStorageGB: 5, maxApiCalls: 5000 },
    premium: { maxStudents: 1000, maxTeachers: 100, maxClasses: 200, maxStorageGB: 20, maxApiCalls: 50000 },
    enterprise: { maxStudents: 10000, maxTeachers: 1000, maxClasses: 2000, maxStorageGB: 100, maxApiCalls: 100000 }
  };

  const subscription = {
    plan,
    status: plan === 'trial' ? 'trial' : 'active',
    limits: planLimits[plan] || planLimits.free,
    usage: { students: 0, teachers: 0, classes: 0, storageGB: 0, apiCalls: 0 }
  };

  if (plan === 'trial') {
    subscription.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
  } else {
    subscription.renewsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
  }

  return subscription;
}

/**
 * Check subdomain availability
 */
async function checkSubdomainAvailability(domain) {
  // Check against reserved names
  const reserved = ['www', 'api', 'app', 'admin', 'mail', 'ftp', 'support', 'help', 'docs'];
  if (reserved.includes(domain.toLowerCase())) {
    return false;
  }

  // Check against existing tenants
  if (tenantRegistry.has(domain)) {
    return false;
  }

  // In production, check DNS records
  try {
    await dns.lookup(`${domain}.buildaq.com`);
    return false; // Domain already exists
  } catch (error) {
    return true; // Domain doesn't exist, available
  }
}

/**
 * Create tenant database
 */
async function createTenantDatabase(tenantConfig) {
  // In production, integrate with your database provider
  console.log(`Creating database for tenant: ${tenantConfig.id}`);
  
  // Mock database creation
  tenantDatabases.set(tenantConfig.id, {
    connectionString: `postgresql://${tenantConfig.databaseConfig.username}:${tenantConfig.databaseConfig.password}@${tenantConfig.databaseConfig.host}:${tenantConfig.databaseConfig.port}/${tenantConfig.databaseConfig.database}`,
    schema: tenantConfig.databaseConfig.schema,
    createdAt: new Date()
  });

  // Run database migrations
  await runDatabaseMigrations(tenantConfig.id);
}

/**
 * Run database migrations for tenant
 */
async function runDatabaseMigrations(tenantId) {
  console.log(`Running migrations for tenant: ${tenantId}`);
  // In production, run your actual migrations here
}

/**
 * Setup DNS records
 */
async function setupDNSRecords(tenantId, customDomain) {
  console.log(`Setting up DNS for tenant: ${tenantId}`);
  // In production, integrate with your DNS provider (Route53, CloudFlare, etc.)
}

/**
 * Remove sensitive data from tenant object
 */
function sanitizeTenantData(tenant) {
  const { adminPasswordHash, databaseConfig, ...sanitized } = tenant;
  return sanitized;
}

/**
 * Validate domain name format
 */
function isValidDomainName(domain) {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*$/;
  return domainRegex.test(domain) && domain.length >= 3 && domain.length <= 63;
}

/**
 * Generate domain alternatives
 */
function generateDomainAlternatives(domain) {
  return [
    `${domain}-school`,
    `${domain}-academy`,
    `${domain}-edu`,
    `${domain}1`,
    `${domain}2`,
    `${domain}-hs`
  ];
}

/**
 * Generate random password
 */
function generateRandomPassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Update tenant database
 */
async function updateTenantDatabase(tenantId, config) {
  console.log(`Updating database config for tenant: ${tenantId}`);
  // In production, update database configuration
}

/**
 * Delete tenant database
 */
async function deleteTenantDatabase(tenantId) {
  console.log(`Deleting database for tenant: ${tenantId}`);
  tenantDatabases.delete(tenantId);
  // In production, safely delete tenant database
}

/**
 * Remove DNS records
 */
async function removeDNSRecords(tenantId) {
  console.log(`Removing DNS records for tenant: ${tenantId}`);
  // In production, remove DNS records
}

// Initialize demo tenant for development
(async function initializeDemoTenant() {
  if (!tenantRegistry.has('demo')) {
    const demoTenant = await generateTenantConfiguration({
      schoolName: 'Demo School District',
      tenantId: 'demo',
      adminEmail: 'admin@demo.buildaq.com',
      adminName: 'Demo Administrator',
      adminPassword: 'demo123456',
      phone: '+1-555-0123',
      plan: 'trial',
      features: {
        gradebook: true,
        reports: true,
        analytics: true,
        bulkOperations: true,
        dataExport: true,
        realTimeUpdates: true,
        notifications: true,
        customBranding: true,
        apiAccess: true,
        advancedReporting: true
      },
      branding: {
        logo: '',
        favicon: '/favicon.ico',
        primaryColor: '#2563eb',
        secondaryColor: '#16a34a',
        accentColor: '#dc2626',
        logoUrl: '',
        fontFamily: 'Inter, sans-serif'
      },
      settings: {
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD',
        language: 'en-US'
      }
    });

    tenantRegistry.set('demo', demoTenant);
    console.log('✅ Demo tenant initialized successfully');
  }
})();

module.exports = router;