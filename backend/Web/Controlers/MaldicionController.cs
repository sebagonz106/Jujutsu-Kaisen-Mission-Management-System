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
    public class MaldicionController : ControllerBase
    {
        private readonly IMaldicionService _service;
        private readonly IAuditService _auditService;

        public MaldicionController(IMaldicionService service, IAuditService auditService)
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
        [Authorize]
        public async Task<IActionResult> GetAll([FromQuery] int? limit, [FromQuery] int? cursor)
        {
            if (limit.HasValue || cursor.HasValue)
            {
                var lim = limit ?? 20;
                var (items, nextCursor, hasMore) = await _service.GetPagedAsync(cursor, lim);
                return Ok(new { items, nextCursor, hasMore });
            }
            var maldiciones = await _service.GetAllAsync();
            return Ok(maldiciones);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Maldicion>> GetById(int id)
        {
            var maldicion = await _service.GetByIdAsync(id);
            if (maldicion == null)
                return NotFound("La maldición que buscas no existe.");

            return Ok(maldicion);
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Maldicion>> Create([FromBody] Maldicion maldicion)
        {
            if (!ModelState.IsValid)
                return BadRequest("Envíe una maldición válida.");

            var created = await _service.CreateAsync(maldicion);
            
            var (role, name) = GetActorInfo();
            await _auditService.LogActionAsync("maldicion", "create", created!.Id, role, null, name, $"Creada maldición: {created.Nombre}");
            
            return CreatedAtAction(nameof(GetById), new { id = created!.Id }, created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Maldicion maldicion)
        {
            if (!ModelState.IsValid)
                return BadRequest("Envíe una maldición válida.");

            var updated = await _service.UpdateAsync(id, maldicion);
            if (!updated)
                return NotFound("La maldición que desea editar no existe.");

            var (role, name) = GetActorInfo();
            await _auditService.LogActionAsync("maldicion", "update", id, role, null, name, $"Actualizada maldición: {maldicion.Nombre}");

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var maldicion = await _service.GetByIdAsync(id);
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
                return NotFound("La maldición que desea eliminar no existe.");

            var (role, name) = GetActorInfo();
            await _auditService.LogActionAsync("maldicion", "delete", id, role, null, name, $"Eliminada maldición: {maldicion?.Nombre}");

            return NoContent();
        }
    }
}
