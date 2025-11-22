using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuildAQ.SchoolsApi.Data;
using BuildAQ.SchoolsApi.Models;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Route("api/v1/[controller]")]
    public class SchoolsController : ControllerBase
    {
        private readonly BuildAQ.SchoolsApi.Data.SchoolsDbContext _context;

        public SchoolsController(BuildAQ.SchoolsApi.Data.SchoolsDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Tenant-aware students list. Tenant can be provided via the `X-Tenant-ID` header
        /// or the `tenantId` query parameter. Returns an ApiResponse-shaped object
        /// compatible with the front-end `ApiService`.
        /// </summary>
        [HttpGet("students")]
        public async Task<IActionResult> GetStudents([FromQuery] string? tenantId)
        {
            // Determine effective tenant id in the following priority:
            // 1. tenant_id claim on authenticated principal (preferred)
            // 2. X-Tenant-ID header (may be numeric or domain)
            // 3. tenantId query parameter (may be numeric or domain)

            int? effectiveTenantId = null;

            // 1) Check authenticated user claims for tenant identifiers
            try
            {
                var claimTenant = User?.FindFirst("tenant_id")?.Value ?? User?.FindFirst("tenantId")?.Value ?? User?.FindFirst("tenant")?.Value;
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
                // best-effort - proceed to headers/queries
            }

            // 2) If still unset, check X-Tenant-ID header
            if (effectiveTenantId == null && Request.Headers.TryGetValue("X-Tenant-ID", out var headerVals))
            {
                var headerRaw = headerVals.FirstOrDefault();
                if (!string.IsNullOrEmpty(headerRaw))
                {
                    if (int.TryParse(headerRaw, out var parsed)) effectiveTenantId = parsed;
                    else
                    {
                        var t = await _context.Tenants.AsNoTracking().FirstOrDefaultAsync(x => x.Domain == headerRaw || x.Name == headerRaw);
                        if (t != null) effectiveTenantId = t.Id;
                    }
                }
            }

            // 3) If still unset, check query parameter which may be numeric or domain
            if (effectiveTenantId == null && !string.IsNullOrEmpty(tenantId))
            {
                if (int.TryParse(tenantId, out var qparsed)) effectiveTenantId = qparsed;
                else
                {
                    var t2 = await _context.Tenants.AsNoTracking().FirstOrDefaultAsync(x => x.Domain == tenantId || x.Name == tenantId);
                    if (t2 != null) effectiveTenantId = t2.Id;
                }
            }

            if (effectiveTenantId == null)
            {
                // If tenant is not provided or could not be resolved, return empty list but success=true
                return Ok(new { success = true, data = new object[] { }, message = "No tenant provided or tenant could not be resolved" });
            }

            var students = await _context.Users
                .AsNoTracking()
                .Where(u => u.TenantId == effectiveTenantId)
                .Select(u => new
                {
                    id = u.Id,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    email = u.Email,
                    grade = u.GradeLevel,
                    // try to pick a class name if available
                    @class = u.Classes.Select(c => c.Name).FirstOrDefault(),
                    enrollmentDate = u.EnrollmentDate,
                    status = u.Status != null ? (u.Status.Name ?? "active") : "active"
                })
                .ToListAsync();

            return Ok(new { success = true, data = students });
        }
    }
}
