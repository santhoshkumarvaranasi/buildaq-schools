using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuildAQ.SchoolsApi.Data;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/v1/teachers")]
    public class TeachersController : ControllerBase
    {
        private readonly SchoolsDbContext _context;
        public TeachersController(SchoolsDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            try
            {
                var teachers = await _context.Users
                    .Include(u => u.Roles)
                    .Include(u => u.Status)
                    .Include(u => u.Classes)
                    .Include(u => u.Departments)
                    .Include(u => u.ClassSubjects)
                        .ThenInclude(cs => cs.Subject)
                    .Where(u => u.Roles.Any(r => r.Name.ToLower() == "teacher"))
                    .Select(u => new
                    {
                        id = u.Id,
                        firstName = u.FirstName,
                        lastName = u.LastName,
                        fullName = (u.FirstName + " " + u.LastName).Trim(),
                        email = u.Email,
                        phone = u.Phone,
                        qualification = u.Qualification,
                        experience = u.Experience,
                        hireDate = u.HireDate,
                        avatar = u.Avatar,
                        status = u.Status != null ? u.Status.Name : null,
                        classesCount = u.Classes != null ? u.Classes.Count : 0,
                        departments = u.Departments != null ? u.Departments.Select(d => d.Name).ToArray() : new string[0],
                        subjects = u.ClassSubjects != null ? u.ClassSubjects.Where(cs => cs.Subject != null).Select(cs => cs.Subject!.Name).Distinct().ToArray() : new string[0]
                    })
                    .ToListAsync();

                return Ok(teachers);
            }
            catch (Exception ex)
            {
                // Log and return an empty result in development so UI stays responsive during local work
                Console.Error.WriteLine($"Teachers summary query failed: {ex}");
                if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
                {
                    return Ok(new object[0]);
                }
                return StatusCode(500);
            }
        }
    }
}
