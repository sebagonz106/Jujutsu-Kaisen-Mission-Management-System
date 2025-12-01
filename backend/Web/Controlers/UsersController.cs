using GestionDeMisiones.IRepository;
using GestionDeMisiones.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionDeMisiones.Web.Controlers
{
    [ApiController]
    [Route("users")] // prefijado globalmente por RoutePrefixConvention("api/v1")
    // [Authorize(Roles = "admin")] // Solo super admin puede controlar usuarios
    public class UsersController : ControllerBase
    {
        private readonly IUsuarioRepository _repo;
        public UsersController(IUsuarioRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<ActionResult<List<UsuarioDto>>> GetAll()
        {
            var list = await _repo.GetAllAsync();
            return Ok(list.Select(UsuarioDto.FromModel).ToList());
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<UsuarioDto>> Get(int id)
        {
            var u = await _repo.GetByIdAsync(id);
            if (u == null) return NotFound();
            return Ok(UsuarioDto.FromModel(u));
        }

        [HttpPost]
        public async Task<ActionResult<UsuarioDto>> Create([FromBody] CreateUsuarioRequest req)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var hash = BCrypt.Net.BCrypt.HashPassword(req.Password);
            var newUser = new Usuario
            {
                Nombre = req.Nombre,
                Email = req.Email,
                PasswordHash = hash,
                Rol = NormalizeRole(req.Rol),
                Rango = req.Rango
            };
            var created = await _repo.AddAsync(newUser);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, UsuarioDto.FromModel(created));
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<UsuarioDto>> Update(int id, [FromBody] UpdateUsuarioRequest req)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return NotFound();
            existing.Nombre = req.Nombre ?? existing.Nombre;
            existing.Email = req.Email ?? existing.Email;
            if (!string.IsNullOrWhiteSpace(req.Password))
            {
                existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);
            }
            if (!string.IsNullOrWhiteSpace(req.Rol))
            {
                existing.Rol = NormalizeRole(req.Rol!);
            }
            existing.Rango = req.Rango ?? existing.Rango;
            var updated = await _repo.UpdateAsync(existing);
            return Ok(UsuarioDto.FromModel(updated!));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _repo.DeleteAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpPost("{id:int}/role")]
        public async Task<IActionResult> SetRole(int id, [FromBody] SetRoleRequest req)
        {
            var ok = await _repo.SetRoleAsync(id, NormalizeRole(req.Rol));
            if (!ok) return NotFound();
            return NoContent();
        }

        private static string NormalizeRole(string input)
        {
            var r = input?.Trim().ToLowerInvariant();
            return r switch
            {
                "hechicero" => "hechicero",
                "sorcerer" => "hechicero",
                "support" => "support",
                "admin" => "admin",
                _ => "support"
            };
        }
    }

    public record UsuarioDto(int Id, string Nombre, string Email, string Rol, string? Rango, DateTime CreadoEn)
    {
        public static UsuarioDto FromModel(Usuario u) => new(u.Id, u.Nombre, u.Email, u.Rol, u.Rango, u.CreadoEn);
    }

    public class CreateUsuarioRequest
    {
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Rol { get; set; } = "observer";
        public string? Rango { get; set; }
    }

    public class UpdateUsuarioRequest
    {
        public string? Nombre { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? Rol { get; set; }
        public string? Rango { get; set; }
    }

    public class SetRoleRequest
    {
        public string Rol { get; set; } = "observer";
    }
}
