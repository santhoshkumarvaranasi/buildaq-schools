using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuildAQ.SchoolsApi.Controllers;
using BuildAQ.SchoolsApi.Data;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Route("api/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        private readonly Data.SchoolsDbContext _context;
        public DepartmentsController(Data.SchoolsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return Ok(new object[0]);
            return Ok(await _context.Departments.AsNoTracking().Where(d => d.TenantId == tenantId).ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return Ok(new { success = true, data = new object[] { }, message = "No tenant provided or tenant could not be resolved" });
            var department = await _context.Departments.FindAsync(id);
            if (department == null || department.TenantId != tenantId) return NotFound();
            return Ok(department);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Models.Department department)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return BadRequest(new { error = "tenant required" });
            department.TenantId = tenantId.Value;
            _context.Departments.Add(department);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = department.Id }, department);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Models.Department department)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return BadRequest(new { error = "tenant required" });
            if (id != department.Id) return BadRequest();
            if (department.TenantId != tenantId) return Forbid();
            _context.Entry(department).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return BadRequest(new { error = "tenant required" });
            var department = await _context.Departments.FindAsync(id);
            if (department == null || department.TenantId != tenantId) return NotFound();
            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}