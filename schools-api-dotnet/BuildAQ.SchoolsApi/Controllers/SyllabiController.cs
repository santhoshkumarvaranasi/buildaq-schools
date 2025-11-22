using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuildAQ.SchoolsApi.Data;
using BuildAQ.SchoolsApi.Models;
using BuildAQ.SchoolsApi.Controllers;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SyllabiController : ControllerBase
    {
        private readonly BuildAQ.SchoolsApi.Data.SchoolsDbContext _context;
        public SyllabiController(BuildAQ.SchoolsApi.Data.SchoolsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return Ok(new object[0]);
            var syllabi = await _context.Set<Syllabus>().AsNoTracking().Where(s => s.TenantId == tenantId).ToListAsync();
            return Ok(syllabi);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return Ok(new { success = true, data = new object[] { }, message = "No tenant provided or tenant could not be resolved" });
            var syllabus = await _context.Set<Syllabus>().FindAsync(id);
            if (syllabus == null || syllabus.TenantId != tenantId) return NotFound();
            return Ok(syllabus);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Syllabus syllabus)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return BadRequest(new { error = "tenant required" });
            syllabus.TenantId = tenantId.Value;
            _context.Set<Syllabus>().Add(syllabus);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = syllabus.Id }, syllabus);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Syllabus syllabus)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return BadRequest(new { error = "tenant required" });
            if (id != syllabus.Id) return BadRequest();
            if (syllabus.TenantId != tenantId) return Forbid();
            _context.Entry(syllabus).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return BadRequest(new { error = "tenant required" });
            var syllabus = await _context.Set<Syllabus>().FindAsync(id);
            if (syllabus == null || syllabus.TenantId != tenantId) return NotFound();
            _context.Set<Syllabus>().Remove(syllabus);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}