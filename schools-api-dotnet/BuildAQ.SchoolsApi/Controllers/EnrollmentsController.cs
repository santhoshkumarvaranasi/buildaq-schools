using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuildAQ.SchoolsApi.Data;
using BuildAQ.SchoolsApi.Models;
using BuildAQ.SchoolsApi.Controllers;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Route("api/v1/[controller]")]
    public class EnrollmentsController : ControllerBase
    {
        private readonly BuildAQ.SchoolsApi.Data.SchoolsDbContext _context;
        public EnrollmentsController(BuildAQ.SchoolsApi.Data.SchoolsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return Ok(new object[0]);
            var items = await _context.Enrollments.AsNoTracking().Where(e => e.TenantId == tenantId).ToListAsync();
            return Ok(items);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return Ok(new object[0]);

            var summary = await _context.Enrollments
                .Where(e => e.TenantId == tenantId)
                .Include(e => e.Student)
                .Include(e => e.Status)
                .Select(e => new
                {
                    id = e.Id,
                    studentId = e.Student != null ? (int?)e.Student.Id : e.StudentId,
                    studentName = e.Student != null ? (e.Student.FirstName + " " + e.Student.LastName).Trim() : null,
                    classId = e.ClassId,
                    status = e.Status != null ? e.Status.Name : null
                })
                .ToListAsync();

            return Ok(summary);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return Ok(new { success = true, data = new object[] { }, message = "No tenant provided or tenant could not be resolved" });

            var item = await _context.Enrollments.FindAsync(id);
            if (item == null || item.TenantId != tenantId) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Enrollment item)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return BadRequest(new { error = "tenant required" });
            item.TenantId = tenantId.Value;
            _context.Enrollments.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Enrollment item)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return BadRequest(new { error = "tenant required" });
            if (id != item.Id) return BadRequest();
            if (item.TenantId != tenantId) return Forbid();
            _context.Entry(item).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return BadRequest(new { error = "tenant required" });

            var item = await _context.Enrollments.FindAsync(id);
            if (item == null || item.TenantId != tenantId) return NotFound();
            _context.Enrollments.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}