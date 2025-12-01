using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IServices;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class TecnicaMalditaController : ControllerBase
{
    private readonly ITecnicaMalditaService _service;
    private readonly IAuditService _auditService;

    public TecnicaMalditaController(ITecnicaMalditaService service, IAuditService auditService)
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
    // [Authorize]
    public async Task<IActionResult> GetAllTecnicaMaldita([FromQuery] int? limit, [FromQuery] int? cursor)
    {
        if (limit.HasValue || cursor.HasValue)
        {
            var lim = limit ?? 20;
            var (items, nextCursor, hasMore) = await _service.GetPagedAsync(cursor, lim);
            return Ok(new { items, nextCursor, hasMore });
        }
        var tecnicas = await _service.GetAllAsync();
        return Ok(tecnicas);
    }

    [HttpGet("{id}")]
    // [Authorize]
    public async Task<ActionResult<TecnicaMaldita>> GetTecnicaMaldita(int id)
    {
        var tecnica = await _service.GetByIdAsync(id);
        if (tecnica == null)
            return NotFound("La técnica maldita que buscas no existe");
        return Ok(tecnica);
    }

    [HttpPost]
    // [Authorize(Roles = "admin")]
    public async Task<ActionResult<TecnicaMaldita>> PostTecnicaMaldita([FromBody] TecnicaMaldita tecnica)
    {
        if (!ModelState.IsValid)
            return BadRequest("La técnica maldita no cumple el formato");

        try
        {
            var created = await _service.CreateAsync(tecnica);
            
            var (role, rank, name) = GetActorInfo();
            await _auditService.LogActionAsync("tecnica", "create", created.Id, role, rank, name, $"Creada técnica: {created.Nombre}");
            
            return CreatedAtAction(nameof(GetTecnicaMaldita), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    // [Authorize(Roles = "admin")]
    public async Task<IActionResult> PutTecnicaMaldita(int id, [FromBody] TecnicaMaldita tecnica)
    {
        if (!ModelState.IsValid)
            return BadRequest("La técnica maldita no cumple el formato");

        try
        {
            var updated = await _service.UpdateAsync(id, tecnica);
            if (!updated)
                return NotFound("La técnica maldita que quiere modificar no existe");

            var (role, rank, name) = GetActorInfo();
            await _auditService.LogActionAsync("tecnica", "update", id, role, rank, name, $"Actualizada técnica: {tecnica.Nombre}");

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    // [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteTecnicaMaldita(int id)
    {
        var tecnica = await _service.GetByIdAsync(id);
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound("La técnica maldita que quiere eliminar no existe");

        var (role, rank, name) = GetActorInfo();
        await _auditService.LogActionAsync("tecnica", "delete", id, role, rank, name, $"Eliminada técnica: {tecnica?.Nombre}");

        return NoContent();
    }
}