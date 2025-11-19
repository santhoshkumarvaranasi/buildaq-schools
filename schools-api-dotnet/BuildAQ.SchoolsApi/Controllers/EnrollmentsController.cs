using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuildAQ.SchoolsApi.Data;
using BuildAQ.SchoolsApi.Models;

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
            var items = await _context.Enrollments.ToListAsync();
            return Ok(items);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = await _context.Enrollments
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
            var item = await _context.Enrollments.FindAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Enrollment item)
        {
            _context.Enrollments.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Enrollment item)
        {
            if (id != item.Id) return BadRequest();
            _context.Entry(item).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.Enrollments.FindAsync(id);
            if (item == null) return NotFound();
            _context.Enrollments.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}