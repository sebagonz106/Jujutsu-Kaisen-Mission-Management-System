using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IServices;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class MisionController : ControllerBase
{
    private readonly IMisionService _service;
    private readonly IAuditService _auditService;

    public MisionController(IMisionService service, IAuditService auditService)
    {
        _service = service;
        _auditService = auditService;
    }

    private (string role, string? rank, string? name) GetActorInfo()
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "unknown";
        var rank = User.FindFirst("rank")?.Value;
        var name = User.FindFirst("name")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value;
        return (role, rank, name);
    }

    [HttpGet]
    // [Authorize] // requiere autenticación para lectura
    public async Task<IActionResult> GetAllMision([FromQuery] int? limit, [FromQuery] int? cursor)
    {
        // If pagination params are provided, return paginated shape
        if (limit.HasValue || cursor.HasValue)
        {
            var lim = limit ?? 20;
            var (items, nextCursor, hasMore) = await _service.GetPagedAsync(cursor, lim);
            return Ok(new { items, nextCursor, hasMore });
        }

        var misiones = await _service.GetAllAsync();
        return Ok(misiones);
    }

    [HttpGet("{id}")]
    // [Authorize]
    public async Task<ActionResult<Mision>> GetMision(int id)
    {
        var mision = await _service.GetByIdAsync(id);
        if (mision == null)
            return NotFound("La misión que buscas no existe");
        return Ok(mision);
    }

    [HttpPost]
    [ApiExplorerSettings(IgnoreApi = true)]  // Bloquear creación manual - Misiones se generan automáticamente desde Solicitud
    // [Authorize(Roles = "admin")] // solo super admin puede crear
    public async Task<IActionResult> PostMision([FromBody] Mision mision)
    {
        return StatusCode(403, new { error = "Las Misiones se crean automáticamente al cambiar una Solicitud a estado 'atendiendose'. No se pueden crear manualmente." });
    }

    [HttpPut("{id}")]
    // [Authorize(Roles = "admin")] // solo super admin puede actualizar
    public async Task<IActionResult> PutMision(int id, [FromBody] GestionDeMisiones.Web.DTOs.MisionUpdateRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest("La misión no cumple el formato");

        try
        {
            var (success, message, generatedData) = await _service.UpdateAsync(id, request);
            if (!success)
                return NotFound(message);

            var (role, rank, name) = GetActorInfo();
            await _auditService.LogActionAsync("mision", "update", id, role, rank, name, $"Actualizada misión #{id}");

            return Ok(new { message, generatedData });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    // [Authorize(Roles = "admin")] // solo super admin puede eliminar
    public async Task<IActionResult> DeleteMision(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound("La misión que quiere eliminar no existe");

        var (role, rank, name) = GetActorInfo();
        await _auditService.LogActionAsync("mision", "delete", id, role, rank, name, $"Eliminada misión #{id}");

        return NoContent();
    }
}