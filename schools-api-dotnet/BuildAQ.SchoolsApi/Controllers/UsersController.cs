using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuildAQ.SchoolsApi.Data;
using BuildAQ.SchoolsApi.Controllers;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly Data.SchoolsDbContext _context;
        public UsersController(Data.SchoolsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null)
            {
                return Ok(new object[0]);
            }
            var users = await _context.Users.AsNoTracking().Where(u => u.TenantId == tenantId).ToListAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null)
            {
                return Ok(new { success = true, data = new object[] { }, message = "No tenant provided or tenant could not be resolved" });
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null || user.TenantId != tenantId) return NotFound();
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Models.User user)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null)
            {
                return BadRequest(new { error = "tenant required" });
            }
            user.TenantId = tenantId;
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Models.User user)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return BadRequest(new { error = "tenant required" });
            if (id != user.Id) return BadRequest();
            if (user.TenantId != tenantId) return Forbid();
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
            if (tenantId == null) return BadRequest(new { error = "tenant required" });

            var user = await _context.Users.FindAsync(id);
            if (user == null || user.TenantId != tenantId) return NotFound();
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}