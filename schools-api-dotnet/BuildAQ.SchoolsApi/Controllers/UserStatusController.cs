using Microsoft.AspNetCore.Mvc;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserStatusController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(new[] { new { UserStatusId = 1, Name = "Sample User Status" } });
        }
    }
}