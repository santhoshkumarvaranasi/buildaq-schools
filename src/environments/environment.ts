export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiVersion: 'v1',
  multiTenant: {
    enabled: false,
    defaultTenant: 'default',
    tenantDetectionMode: 'subdomain', // 'subdomain' | 'domain' | 'path'
    tenantApiEndpoint: '/tenants'
  }
};