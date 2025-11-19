using Microsoft.AspNetCore.Mvc;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TopicScheduleController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(new[] { new { TopicScheduleId = 1, Name = "Sample Topic Schedule" } });
        }
    }
}