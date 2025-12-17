using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IServices;
using GestionDeMisiones.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class SolicitudController : ControllerBase
{
    private readonly ISolicitudService _service;
    private readonly Microsoft.Extensions.Logging.ILogger<SolicitudController> _logger;
    private readonly IAuditService _auditService;

    public SolicitudController(ISolicitudService service, IAuditService auditService, Microsoft.Extensions.Logging.ILogger<SolicitudController> logger)
    {
        _service = service;
        _auditService = auditService;
        _logger = logger;
    }

    private (string role, string? name) GetActorInfo()
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "unknown";
        var name = User.FindFirst("name")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value;
        return (role, name);
    }

    [HttpGet]
    // [Authorize]
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
    // [Authorize]
    public async Task<ActionResult<Solicitud>> GetSolicitudById(int id)
    {
        var solicitud = await _service.GetByIdAsync(id);
        if (solicitud == null)
            return NotFound("La solicitud que buscas no existe");
        return Ok(solicitud);
    }

    [HttpGet("{id}/detail")]
    // [Authorize]
    public async Task<IActionResult> GetSolicitudDetail(int id)
    {
        var solicitud = await _service.GetByIdAsync(id);
        if (solicitud == null)
            return NotFound("La solicitud que buscas no existe");

        object response = new
        {
            id = solicitud.Id,
            maldicionId = solicitud.MaldicionId,
            estado = solicitud.Estado,
            hechiceroEncargadoId = (int?)null,
            nivelUrgencia = (string?)null
        };

        // Si la solicitud está en estado "atendiendose" o superior, obtener hechicero y urgencia
        if (solicitud.Estado == EEstadoSolicitud.atendiendose || 
            solicitud.Estado == EEstadoSolicitud.atendida)
        {
            // Obtener el primer HechiceroEncargado asociado (si existe)
            var hechiceroEncargado = await _service.GetHechiceroEncargadoDetailAsync(id);
            if (hechiceroEncargado != null)
            {
                response = new
                {
                    id = solicitud.Id,
                    maldicionId = solicitud.MaldicionId,
                    estado = solicitud.Estado,
                    hechiceroEncargadoId = (int?)hechiceroEncargado.hechiceroId,
                    nivelUrgencia = (string?)hechiceroEncargado.nivelUrgencia
                };
            }
        }

        return Ok(response);
    }

    [HttpPost]
    [ApiExplorerSettings(IgnoreApi = true)]  // Bloquear creación manual - Solicitudes se generan automáticamente desde Maldición
    // [Authorize(Roles = "admin")]
    public async Task<IActionResult> NewSolicitud([FromBody] Solicitud solicitud)
    {
        return StatusCode(403, new { error = "Las Solicitudes se crean automáticamente al crear una Maldición. No se pueden crear manualmente." });
    }

    [HttpPut("{id}")]
    // [Authorize(Roles = "admin")]
    public async Task<IActionResult> PutSolicitud(int id, [FromBody] SolicitudUpdateRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest("Envíe una solicitud válida");

        try
        {
            var (success, message, generatedData) = await _service.UpdateAsync(id, request);
            
            if (!success)
                return BadRequest(message);

            var (role, name) = GetActorInfo();
            var auditMessage = $"Actualizada solicitud #{id}. {message}";
            if (generatedData != null)
                auditMessage += $" (Misión: {generatedData.misionId}, HechiceroEncargado: {generatedData.hechiceroEncargadoId})";
            
            await _auditService.LogActionAsync("solicitud", "update", id, role, null, name, auditMessage);

            return Ok(new { success = true, message, generatedData });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar solicitud {SolicitudId}", id);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    // [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteSolicitud(int id)
    {
        _logger.LogWarning($"Intento de eliminar Solicitud: {id}");
        try
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
            {
                _logger.LogWarning($"No se encontró la solicitud {id} para eliminar");
                return NotFound("La solicitud que quiere eliminar no existe");
            }

            var (role, name) = GetActorInfo();
            await _auditService.LogActionAsync("solicitud", "delete", id, role, null, name, $"Eliminada solicitud #{id}");
            _logger.LogInformation($"Solicitud {id} eliminada correctamente");
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, $"Error al eliminar solicitud {id}: {ex.Message}");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error inesperado al eliminar solicitud {id}: {ex.Message}");
            return StatusCode(500, "Error inesperado al eliminar la solicitud");
        }
    }
}