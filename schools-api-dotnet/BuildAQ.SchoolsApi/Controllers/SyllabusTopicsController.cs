using Microsoft.AspNetCore.Mvc;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SyllabusTopicsController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(new[] { new { SyllabusTopicId = 1, Name = "Sample Syllabus Topic" } });
        }
    }
}