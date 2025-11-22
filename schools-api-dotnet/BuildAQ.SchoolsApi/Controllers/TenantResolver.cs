using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using BuildAQ.SchoolsApi.Data;

namespace BuildAQ.SchoolsApi.Controllers
{
    public static class TenantResolver
    {
        public static async Task<int?> ResolveAsync(HttpContext httpContext, SchoolsDbContext _context, string? tenantQuery = null)
        {
            int? effectiveTenantId = null;

            // 1) Check authenticated user claims for tenant identifiers
            try
            {
                var user = httpContext.User;
                var claimTenant = user?.FindFirst("tenant_id")?.Value ?? user?.FindFirst("tenantId")?.Value ?? user?.FindFirst("tenant")?.Value;
                if (!string.IsNullOrEmpty(claimTenant))
                {
                    if (int.TryParse(claimTenant, out var parsedClaim))
                    {
                        effectiveTenantId = parsedClaim;
                    }
                    else
                    {
                        var resolved = await _context.Tenants.AsNoTracking().FirstOrDefaultAsync(x => x.Domain == claimTenant || x.Name == claimTenant);
                        if (resolved != null) effectiveTenantId = resolved.Id;
                    }
                }
            }
            catch
            {
                // ignore and continue
            }

            // 2) Header
            try
            {
                if (effectiveTenantId == null && httpContext.Request.Headers.TryGetValue("X-Tenant-ID", out var headerVals))
                {
                    var headerRaw = headerVals.FirstOrDefault();
                    // Sanitize obvious malformed values: trim whitespace and strip a leading '?' (common accidental value)
                    try
                    {
                        if (!string.IsNullOrEmpty(headerRaw))
                        {
                            headerRaw = headerRaw.Trim();
                            if (headerRaw == "?") headerRaw = string.Empty;
                            // Strip one or more leading question marks if present
                            while (!string.IsNullOrEmpty(headerRaw) && headerRaw.StartsWith("?")) headerRaw = headerRaw.Substring(1);
                            if (!string.IsNullOrEmpty(headerRaw)) headerRaw = headerRaw.Trim();
                        }
                    }
                    catch { }
                    // Debug: log the raw header value received so we can trace malformed inputs
                    try
                    {
                        if (!string.IsNullOrEmpty(headerRaw))
                        {
                            System.Console.WriteLine($"TenantResolver: received X-Tenant-ID header -> '{headerRaw}'");
                        }
                        else
                        {
                            System.Console.WriteLine("TenantResolver: X-Tenant-ID header present but empty");
                        }
                    }
                    catch { }

                    if (!string.IsNullOrEmpty(headerRaw))
                    {
                        if (int.TryParse(headerRaw, out var parsed)) effectiveTenantId = parsed;
                        else
                        {
                            // Debug: indicate we're performing a domain->id lookup
                            try { System.Console.WriteLine($"TenantResolver: performing domain lookup for '{headerRaw}'"); } catch { }
                            var t = await _context.Tenants.AsNoTracking().FirstOrDefaultAsync(x => x.Domain == headerRaw || x.Name == headerRaw);
                            if (t != null) effectiveTenantId = t.Id;
                        }
                    }
                }
            }
            catch
            {
                // ignore
            }

            // 3) Query parameter
            try
            {
                if (effectiveTenantId == null && !string.IsNullOrEmpty(tenantQuery))
                {
                    if (int.TryParse(tenantQuery, out var qparsed)) effectiveTenantId = qparsed;
                    else
                    {
                        var t2 = await _context.Tenants.AsNoTracking().FirstOrDefaultAsync(x => x.Domain == tenantQuery || x.Name == tenantQuery);
                        if (t2 != null) effectiveTenantId = t2.Id;
                    }
                }
            }
            catch
            {
            }

            return effectiveTenantId;
        }
    }
}
