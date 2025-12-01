using GestionDeMisiones.IServices;
using GestionDeMisiones.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionDeMisiones.Controllers;

/// <summary>
/// Controlador para gestionar el registro de auditoría del sistema.
/// </summary>
[ApiController]
[Route("[controller]")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    /// <summary>
    /// Obtiene las entradas de auditoría más recientes.
    /// </summary>
    /// <param name="limit">Cantidad máxima de entradas (default: 20, max: 100).</param>
    /// <param name="offset">Desplazamiento para paginación.</param>
    /// <returns>Lista de entradas de auditoría ordenadas por fecha descendente.</returns>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<AuditEntry>>> GetRecentEntries(
        [FromQuery] int limit = 20,
        [FromQuery] int offset = 0)
    {
        // Limitar el máximo de entradas por request
        limit = Math.Min(limit, 100);
        
        var entries = await _auditService.GetRecentEntriesAsync(limit, offset);
        var total = await _auditService.GetTotalCountAsync();
        
        // Añadir headers de paginación
        Response.Headers.Append("X-Total-Count", total.ToString());
        Response.Headers.Append("X-Limit", limit.ToString());
        Response.Headers.Append("X-Offset", offset.ToString());
        
        return Ok(entries);
    }

    /// <summary>
    /// Obtiene una entrada de auditoría específica por su ID.
    /// </summary>
    /// <param name="id">ID de la entrada.</param>
    /// <returns>La entrada de auditoría.</returns>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<AuditEntry>> GetEntryById(int id)
    {
        var entry = await _auditService.GetEntryByIdAsync(id);
        
        if (entry == null)
        {
            return NotFound(new { message = $"Entrada de auditoría con ID {id} no encontrada." });
        }
        
        return Ok(entry);
    }

    /// <summary>
    /// Obtiene entradas de auditoría filtradas por tipo de entidad.
    /// </summary>
    /// <param name="entity">Tipo de entidad (hechicero, maldicion, mision, ubicacion, tecnica).</param>
    /// <param name="limit">Cantidad máxima de entradas.</param>
    /// <returns>Lista de entradas para esa entidad.</returns>
    [HttpGet("entity/{entity}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<AuditEntry>>> GetEntriesByEntity(
        string entity,
        [FromQuery] int limit = 20)
    {
        limit = Math.Min(limit, 100);
        var entries = await _auditService.GetEntriesByEntityAsync(entity, limit);
        return Ok(entries);
    }

    /// <summary>
    /// Crea una nueva entrada de auditoría manualmente.
    /// Solo disponible para administradores.
    /// </summary>
    /// <param name="request">Datos de la entrada a crear.</param>
    /// <returns>La entrada creada.</returns>
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<AuditEntry>> CreateEntry([FromBody] CreateAuditEntryRequest request)
    {
        var entry = await _auditService.LogActionAsync(
            request.Entity,
            request.Action,
            request.EntityId,
            request.ActorRole,
            request.ActorRank,
            request.ActorName,
            request.Summary);

        return CreatedAtAction(nameof(GetEntryById), new { id = entry.Id }, entry);
    }
}

/// <summary>
/// DTO para crear una entrada de auditoría.
/// </summary>
public class CreateAuditEntryRequest
{
    public string Entity { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string ActorRole { get; set; } = string.Empty;
    public string? ActorRank { get; set; }
    public string? ActorName { get; set; }
    public string? Summary { get; set; }
}
