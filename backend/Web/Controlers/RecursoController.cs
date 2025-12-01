using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IServices;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class RecursoController : ControllerBase
{
    private readonly IRecursoService _service;
    private readonly IAuditService _auditService;

    public RecursoController(IRecursoService service, IAuditService auditService)
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
    public async Task<IActionResult> GetAllRecurso([FromQuery] int? limit, [FromQuery] int? cursor)
    {
        if (limit.HasValue || cursor.HasValue)
        {
            var lim = limit ?? 20;
            var (items, nextCursor, hasMore) = await _service.GetPagedAsync(cursor, lim);
            return Ok(new { items, nextCursor, hasMore });
        }
        var recursos = await _service.GetAllAsync();
        return Ok(recursos);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<Recurso>> GetRecurso(int id)
    {
        var recurso = await _service.GetByIdAsync(id);
        if (recurso == null)
            return NotFound("El recurso que buscas no existe");
        return Ok(recurso);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Recurso>> PostRecurso([FromBody] Recurso recurso)
    {
        if (!ModelState.IsValid)
            return BadRequest("El recurso no cumple el formato");

        try
        {
            var created = await _service.CreateAsync(recurso);
            
            var (role, name) = GetActorInfo();
            await _auditService.LogActionAsync("recurso", "create", created.Id, role, null, name, $"Creado recurso: {created.Nombre}");
            
            return CreatedAtAction(nameof(GetRecurso), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> PutRecurso(int id, [FromBody] Recurso recurso)
    {
        if (!ModelState.IsValid)
            return BadRequest("El recurso no cumple el formato");

        try
        {
            var updated = await _service.UpdateAsync(id, recurso);
            if (!updated)
                return NotFound("El recurso que quiere modificar no existe");

            var (role, name) = GetActorInfo();
            await _auditService.LogActionAsync("recurso", "update", id, role, null, name, $"Actualizado recurso: {recurso.Nombre}");

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteRecurso(int id)
    {
        var recurso = await _service.GetByIdAsync(id);
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound("El recurso que quiere eliminar no existe");

        var (role, name) = GetActorInfo();
        await _auditService.LogActionAsync("recurso", "delete", id, role, null, name, $"Eliminado recurso: {recurso?.Nombre}");

        return NoContent();
    }
}