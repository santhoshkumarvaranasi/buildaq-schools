using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuildAQ.SchoolsApi.Data;
using BuildAQ.SchoolsApi.Models;

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
            var syllabi = await _context.Set<Syllabus>().ToListAsync();
            return Ok(syllabi);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var syllabus = await _context.Set<Syllabus>().FindAsync(id);
            if (syllabus == null) return NotFound();
            return Ok(syllabus);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Syllabus syllabus)
        {
            _context.Set<Syllabus>().Add(syllabus);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = syllabus.Id }, syllabus);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Syllabus syllabus)
        {
            if (id != syllabus.Id) return BadRequest();
            _context.Entry(syllabus).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var syllabus = await _context.Set<Syllabus>().FindAsync(id);
            if (syllabus == null) return NotFound();
            _context.Set<Syllabus>().Remove(syllabus);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}