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
            // Include related navigation properties so frontend can display
            // grade, class and status without additional requests.
            var users = await _context.Users
                .AsNoTracking()
                .Where(u => u.TenantId == tenantId)
                .Include(u => u.Status)
                .Include(u => u.Classes)
                .ToListAsync();
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

            // Load user including related Status and Classes so UI can render
            // human-friendly fields without extra API calls.
            var user = await _context.Users
                .Include(u => u.Status)
                .Include(u => u.Classes)
                .FirstOrDefaultAsync(u => u.Id == id);
            if (user == null || user.TenantId != tenantId) return NotFound();
            return Ok(user);
        }

            public class CreateUserDto
            {
                public string? Email { get; set; }
                public string? FirstName { get; set; }
                public string? LastName { get; set; }
                // friendly aliases the frontend might send
                public string? Grade { get; set; }
                public string? GradeLevel { get; set; }
                public string? Section { get; set; }
                public string? Status { get; set; }
                public int? StatusId { get; set; }
                public string? RollNo { get; set; }
                public string? Phone { get; set; }
                public string? Address { get; set; }
                public string? EmailConfirmation { get; set; }
            }

            [HttpPost]
            public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
            {
                var tenantId = await TenantResolver.ResolveAsync(HttpContext, _context);
                if (tenantId == null)
                {
                    return BadRequest(new { error = "tenant required" });
                }

                // Map DTO to EF User entity. Be permissive with field names (grade/gradeLevel, status string/id)
                var user = new Models.User();
                user.Email = dto.Email ?? string.Empty;
                user.FirstName = dto.FirstName;
                user.LastName = dto.LastName;
                user.Phone = dto.Phone;
                user.Address = dto.Address;
                // prefer GradeLevel, fallback to Grade
                user.GradeLevel = dto.GradeLevel ?? dto.Grade;

                // Resolve status: allow either StatusId (int) or Status (string name)
                if (dto.StatusId.HasValue)
                {
                    user.StatusId = dto.StatusId.Value;
                }
                else if (!string.IsNullOrWhiteSpace(dto.Status))
                {
                    var statusName = dto.Status.Trim();
                    var status = await _context.UserStatuses.FirstOrDefaultAsync(s => s.Name.ToLower() == statusName.ToLower());
                    if (status == null)
                    {
                        return BadRequest(new { error = "unknown status", status = dto.Status });
                    }
                    user.StatusId = status.Id;
                }
                else
                {
                    // If no status provided, leave default (model requires an int, use 1 as fallback)
                    user.StatusId = user.StatusId == 0 ? 1 : user.StatusId;
                }

                user.TenantId = tenantId;
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Return the created user including navigation properties for the frontend
                var created = await _context.Users
                    .Include(u => u.Status)
                    .Include(u => u.Classes)
                    .FirstOrDefaultAsync(u => u.Id == user.Id);

                return CreatedAtAction(nameof(Get), new { id = user.Id }, created);
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