using Microsoft.AspNetCore.Mvc;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TopicStatusController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(new[] { new { TopicStatusId = 1, Name = "Sample Topic Status" } });
        }
    }
}