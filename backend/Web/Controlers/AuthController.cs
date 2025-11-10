using GestionDeMisiones.IService;
using GestionDeMisiones.Web.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionDeMisiones.Web.Controlers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var (token, user) = await _authService.LoginAsync(request.Email, request.Password);
                return Ok(new LoginResponse { AccessToken = token, User = user });
            }
            catch (ArgumentException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<RegisterResponse>> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var (token, user) = await _authService.RegisterAsync(request.Name, request.Email, request.Password);
                return Ok(new RegisterResponse { AccessToken = token, User = user });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public ActionResult<MeResponse> Me()
        {
            var user = _authService.GetUserFromClaims(User);
            if (user == null) return Unauthorized();
            return Ok(new MeResponse { User = user });
        }

        [HttpPost("create")]
        [Authorize(Roles = "admin,support")] // permitir admin o support (admin token expuesto como 'admin')
        public async Task<ActionResult<CreateUserResponse>> CreateUser([FromBody] CreateUserRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var user = await _authService.CreateUserAsync(request.Name, request.Email, request.Password, request.Role, request.Rank);
                return Ok(new CreateUserResponse { User = user });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
