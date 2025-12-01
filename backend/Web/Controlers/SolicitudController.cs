using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IServices;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class SolicitudController : ControllerBase
{
    private readonly ISolicitudService _service;
    private readonly IAuditService _auditService;

    public SolicitudController(ISolicitudService service, IAuditService auditService)
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
    public async Task<IActionResult> GetAllSolicitud([FromQuery] int? limit, [FromQuery] int? cursor)
    {
        if (limit.HasValue || cursor.HasValue)
        {
            var lim = limit ?? 20;
            var (items, nextCursor, hasMore) = await _service.GetPagedAsync(cursor, lim);
            return Ok(new { items, nextCursor, hasMore });
        }
        var solicitudes = await _service.GetAllAsync();
        return Ok(solicitudes);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<Solicitud>> GetSolicitudById(int id)
    {
        var solicitud = await _service.GetByIdAsync(id);
        if (solicitud == null)
            return NotFound("La solicitud que buscas no existe");
        return Ok(solicitud);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Solicitud>> NewSolicitud([FromBody] Solicitud solicitud)
    {
        if (!ModelState.IsValid)
            return BadRequest("Envíe una solicitud válida");

        try
        {
            var created = await _service.CreateAsync(solicitud);
            
            var (role, name) = GetActorInfo();
            await _auditService.LogActionAsync("solicitud", "create", created.Id, role, null, name, $"Creada solicitud #{created.Id} para maldición #{created.MaldicionId}");
            
            return CreatedAtAction(nameof(GetSolicitudById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> PutSolicitud(int id, [FromBody] Solicitud solicitud)
    {
        if (!ModelState.IsValid)
            return BadRequest("Envíe una solicitud válida");

        try
        {
            var updated = await _service.UpdateAsync(id, solicitud);
            if (!updated)
                return NotFound("La solicitud que quiere editar no existe");

            var (role, name) = GetActorInfo();
            await _auditService.LogActionAsync("solicitud", "update", id, role, null, name, $"Actualizada solicitud #{id}");

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteSolicitud(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound("La solicitud que quiere eliminar no existe");

        var (role, name) = GetActorInfo();
        await _auditService.LogActionAsync("solicitud", "delete", id, role, null, name, $"Eliminada solicitud #{id}");

        return NoContent();
    }
}