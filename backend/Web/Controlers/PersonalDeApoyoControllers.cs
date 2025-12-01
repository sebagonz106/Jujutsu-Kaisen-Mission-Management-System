using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IServices;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class PersonalDeApoyoController : ControllerBase
{
    private readonly IPersonalDeApoyoService _service;
    private readonly IAuditService _auditService;

    public PersonalDeApoyoController(IPersonalDeApoyoService service, IAuditService auditService)
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
    public async Task<IActionResult> GetPersonalDeApoyo([FromQuery] int? limit, [FromQuery] int? cursor)
    {
        if (limit.HasValue || cursor.HasValue)
        {
            var lim = limit ?? 20;
            var (items, nextCursor, hasMore) = await _service.GetPagedAsync(cursor, lim);
            return Ok(new { items, nextCursor, hasMore });
        }
        var personal = await _service.GetAllAsync();
        return Ok(personal);
    }

    [HttpGet("{id}")]
    // [Authorize]
    public async Task<ActionResult<PersonalDeApoyo>> GetPersonalDeApoyoById(int id)
    {
        var personal = await _service.GetByIdAsync(id);
        if (personal == null)
            return NotFound("El personal de apoyo que busca no se encuentra");
        return Ok(personal);
    }

    [HttpPost]
    // [Authorize(Roles = "admin")]
    public async Task<ActionResult<PersonalDeApoyo>> PostPersonalDeApoyo([FromBody] PersonalDeApoyo personal)
    {
        if (!ModelState.IsValid)
            return BadRequest("Envíe un personal de apoyo válido");

        try
        {
            var created = await _service.CreateAsync(personal);
            
            var (role, name) = GetActorInfo();
            await _auditService.LogActionAsync("personalDeApoyo", "create", created.Id, role, null, name, $"Creado personal de apoyo: {created.Name}");
            
            return CreatedAtAction(nameof(GetPersonalDeApoyoById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    // [Authorize(Roles = "admin")]
    public async Task<IActionResult> PutPersonalDeApoyo(int id, [FromBody] PersonalDeApoyo personal)
    {
        if (!ModelState.IsValid)
            return BadRequest("Envíe un personal de apoyo válido");

        try
        {
            var updated = await _service.UpdateAsync(id, personal);
            if (!updated)
                return NotFound("El personal de apoyo que quiere editar no existe");

            var (role, name) = GetActorInfo();
            await _auditService.LogActionAsync("personalDeApoyo", "update", id, role, null, name, $"Actualizado personal de apoyo: {personal.Name}");

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    // [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeletePersonalDeApoyo(int id)
    {
        var personal = await _service.GetByIdAsync(id);
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound("El personal que quiere eliminar no existe");

        var (role, name) = GetActorInfo();
        await _auditService.LogActionAsync("personalDeApoyo", "delete", id, role, null, name, $"Eliminado personal de apoyo: {personal?.Name}");

        return NoContent();
    }
}