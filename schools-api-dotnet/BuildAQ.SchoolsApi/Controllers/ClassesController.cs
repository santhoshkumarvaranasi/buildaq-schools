using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuildAQ.SchoolsApi.Data;
using BuildAQ.SchoolsApi.Models;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Route("api/v1/[controller]")]
    public class ClassesController : ControllerBase
    {
        private readonly BuildAQ.SchoolsApi.Data.SchoolsDbContext _context;
        public ClassesController(BuildAQ.SchoolsApi.Data.SchoolsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.Classes
                .Include(c => c.Teacher)
                .Include(c => c.Department)
                .Include(c => c.Sections)
                .Include(c => c.AcademicYear)
                .Include(c => c.Enrollments).ThenInclude(e => e.Status)
                .Select(c => new
                {
                    id = c.Id,
                    name = c.Name,
                    code = c.Code,
                    department = c.Department != null ? c.Department.Name : null,
                    teacherName = c.Teacher != null ? (c.Teacher.FirstName + " " + c.Teacher.LastName).Trim() : null,
                    maxStudents = (int?)c.Sections.Sum(s => (int?)s.Capacity) ?? null,
                    enrolledStudents = c.Enrollments.Count(e => e.Status != null && e.Status.Name == "enrolled"),
                    semester = c.AcademicYear != null ? c.AcademicYear.Name : null,
                    status = c.IsActive ? "active" : "inactive",
                    year = c.AcademicYear != null ? (int?)c.AcademicYear.StartDate.Year : null,
                    credits = 0,
                    schedule = new object[] { },
                    prerequisites = new string[] { }
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = await _context.Classes
                .Include(c => c.Teacher)
                .Include(c => c.Department)
                .Include(c => c.Sections)
                .Include(c => c.AcademicYear)
                .Include(c => c.Enrollments).ThenInclude(e => e.Status)
                .Select(c => new
                {
                    id = c.Id,
                    name = c.Name,
                    code = c.Code,
                    department = c.Department != null ? c.Department.Name : null,
                    teacherName = c.Teacher != null ? (c.Teacher.FirstName + " " + c.Teacher.LastName).Trim() : null,
                    maxStudents = (int?)c.Sections.Sum(s => (int?)s.Capacity) ?? null,
                    enrolledStudents = c.Enrollments.Count(e => e.Status != null && e.Status.Name == "enrolled"),
                    semester = c.AcademicYear != null ? c.AcademicYear.Name : null,
                    status = c.IsActive ? "active" : "inactive",
                    year = c.AcademicYear != null ? (int?)c.AcademicYear.StartDate.Year : null
                })
                .ToListAsync();

            return Ok(summary);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var item = await _context.Classes.FindAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Class item)
        {
            _context.Classes.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Class item)
        {
            if (id != item.Id) return BadRequest();
            _context.Entry(item).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.Classes.FindAsync(id);
            if (item == null) return NotFound();
            _context.Classes.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}