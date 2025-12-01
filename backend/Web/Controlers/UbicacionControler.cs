using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IServices;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace GestionDeMisiones.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UbicacionController : ControllerBase
    {
        private readonly IUbicacionService _service;
        private readonly IAuditService _auditService;

        public UbicacionController(IUbicacionService service, IAuditService auditService)
        {
            _service = service;
            _auditService = auditService;
        }

        private (string role, string? name) GetActorInfo()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "unknown";
            var name = User.FindFirst("name")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value;
            return (role, name);
        }

        [HttpGet]
        // [Authorize]
        public async Task<IActionResult> GetAll([FromQuery] int? limit, [FromQuery] int? cursor)
        {
            if (limit.HasValue || cursor.HasValue)
            {
                var lim = limit ?? 20;
                var (items, nextCursor, hasMore) = await _service.GetPagedAsync(cursor, lim);
                return Ok(new { items, nextCursor, hasMore });
            }
            var ubicaciones = await _service.GetAllAsync();
            return Ok(ubicaciones);
        }

        [HttpGet("{id}")]
        // [Authorize]
        public async Task<ActionResult<Ubicacion>> GetById(int id)
        {
            var ubicacion = await _service.GetByIdAsync(id);
            if (ubicacion == null) return NotFound("La ubicación no existe.");
            return Ok(ubicacion);
        }

        [HttpPost]
        // [Authorize(Roles = "admin")]
        public async Task<ActionResult<Ubicacion>> Create([FromBody] Ubicacion ubicacion)
        {
            if (!ModelState.IsValid)
                return BadRequest("Ubicación inválida.");

            var nueva = await _service.AddAsync(ubicacion);
            
            var (role, name) = GetActorInfo();
            await _auditService.LogActionAsync("ubicacion", "create", nueva.Id, role, null, name, $"Creada ubicación: {nueva.Nombre}");
            
            return CreatedAtAction(nameof(GetById), new { id = nueva.Id }, nueva);
        }

        [HttpDelete("{id}")]
        // [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var ubicacion = await _service.GetByIdAsync(id);
            var eliminado = await _service.DeleteAsync(id);
            if (!eliminado) return NotFound("No se encontró la ubicación.");
            
            var (role, name) = GetActorInfo();
            await _auditService.LogActionAsync("ubicacion", "delete", id, role, null, name, $"Eliminada ubicación: {ubicacion?.Nombre}");
            
            return NoContent();
        }

        [HttpPut("{id}")]
        // [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Ubicacion ubicacion)
        {
            var actualizado = await _service.UpdateAsync(id, ubicacion);
            if (actualizado == null) return NotFound("No se encontró la ubicación.");
            
            var (role, name) = GetActorInfo();
            await _auditService.LogActionAsync("ubicacion", "update", id, role, null, name, $"Actualizada ubicación: {actualizado.Nombre}");
            
            return Ok(actualizado);
        }
    }
}
