using Microsoft.AspNetCore.Mvc;

namespace BuildAQ.SchoolsApi.Controllers
{
    using Microsoft.AspNetCore.Authorization;

    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class BuildInfoController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { Name = "BuildAQ Schools API", Version = "1.0.0", Status = "Running" });
        }
    }
}