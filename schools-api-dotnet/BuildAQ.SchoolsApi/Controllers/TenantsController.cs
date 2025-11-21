using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BuildAQ.SchoolsApi.Controllers
{
    using Microsoft.AspNetCore.Authorization;

    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class TenantsController : ControllerBase
    {
        private readonly Data.SchoolsDbContext _context;
        public TenantsController(Data.SchoolsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _context.Tenants.ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var tenant = await _context.Tenants.FindAsync(id);
            if (tenant == null) return NotFound();
            return Ok(tenant);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Models.Tenant tenant)
        {
            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = tenant.Id }, tenant);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Models.Tenant tenant)
        {
            if (id != tenant.Id) return BadRequest();
            _context.Entry(tenant).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tenant = await _context.Tenants.FindAsync(id);
            if (tenant == null) return NotFound();
            _context.Tenants.Remove(tenant);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}