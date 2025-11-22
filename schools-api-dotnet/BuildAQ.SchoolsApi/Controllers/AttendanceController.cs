using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuildAQ.SchoolsApi.Data;
using BuildAQ.SchoolsApi.Models;
using BuildAQ.SchoolsApi.Controllers;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly BuildAQ.SchoolsApi.Data.SchoolsDbContext _context;
        public AttendanceController(BuildAQ.SchoolsApi.Data.SchoolsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return Ok(new object[0]);
            var items = await _context.Attendances.AsNoTracking().Where(a => a.TenantId == tenantId).ToListAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return Ok(new { success = true, data = new object[] { }, message = "No tenant provided or tenant could not be resolved" });
            var item = await _context.Attendances.FindAsync(id);
            if (item == null || item.TenantId != tenantId) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Attendance item)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return BadRequest(new { error = "tenant required" });
            item.TenantId = tenantId.Value;
            _context.Attendances.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Attendance item)
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
            var item = await _context.Attendances.FindAsync(id);
            if (item == null || item.TenantId != tenantId) return NotFound();
            _context.Attendances.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}