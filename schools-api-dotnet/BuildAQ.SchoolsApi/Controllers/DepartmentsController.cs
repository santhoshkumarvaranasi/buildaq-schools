using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
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
            return Ok(await _context.Departments.ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null) return NotFound();
            return Ok(department);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Models.Department department)
        {
            _context.Departments.Add(department);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = department.Id }, department);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Models.Department department)
        {
            if (id != department.Id) return BadRequest();
            _context.Entry(department).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null) return NotFound();
            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}