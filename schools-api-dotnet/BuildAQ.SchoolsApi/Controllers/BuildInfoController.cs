using Microsoft.AspNetCore.Mvc;

namespace BuildAQ.SchoolsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BuildInfoController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { Name = "BuildAQ Schools API", Version = "1.0.0", Status = "Running" });
        }
    }
}