using Microsoft.AspNetCore.Mvc;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubjectsController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            // TODO: Replace with real DB call
            return Ok(new[] { new { SubjectId = 1, Name = "Sample Subject" } });
        }
    }
}