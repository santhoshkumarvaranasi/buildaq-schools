using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuildAQ.SchoolsApi.Data;
using BuildAQ.SchoolsApi.Models;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeeInstallmentsController : ControllerBase
    {
        private readonly BuildAQ.SchoolsApi.Data.SchoolsDbContext _context;
        public FeeInstallmentsController(BuildAQ.SchoolsApi.Data.SchoolsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.FeeInstallments.ToListAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var item = await _context.FeeInstallments.FindAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create(FeeInstallment item)
        {
            _context.FeeInstallments.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, FeeInstallment item)
        {
            if (id != item.Id) return BadRequest();
            _context.Entry(item).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.FeeInstallments.FindAsync(id);
            if (item == null) return NotFound();
            _context.FeeInstallments.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}