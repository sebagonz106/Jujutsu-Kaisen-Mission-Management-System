// Controllers/HechiceroController.cs
using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IServices;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class HechiceroController : ControllerBase
{
    private readonly IHechiceroService _service;
    private readonly IAuditService _auditService;

    public HechiceroController(IHechiceroService service, IAuditService auditService)
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
    [Authorize]
    public async Task<IActionResult> GetAllHechicero([FromQuery] int? limit, [FromQuery] int? cursor)
    {
        if (limit.HasValue || cursor.HasValue)
        {
            var lim = limit ?? 20;
            var (items, nextCursor, hasMore) = await _service.GetPagedAsync(cursor, lim);
            return Ok(new { items, nextCursor, hasMore });
        }
        var hechiceros = await _service.GetAllAsync();
        return Ok(hechiceros);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<Hechicero>> GetHechiceroById(int id)
    {
        var hechicero = await _service.GetByIdAsync(id);
        if (hechicero == null)
            return NotFound("El hechicero que buscas no existe");
        return Ok(hechicero);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<Hechicero>> NewHechicero([FromBody] Hechicero hechicero)
    {
        if (!ModelState.IsValid)
            return BadRequest("Envíe un hechicero válido");

        try
        {
            var created = await _service.CreateAsync(hechicero);
            
            var (role, rank, name) = GetActorInfo();
            await _auditService.LogActionAsync("hechicero", "create", created.Id, role, rank, name, $"Creado hechicero: {created.Name}");
            
            return CreatedAtAction(nameof(GetHechiceroById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> PutHechicero(int id, [FromBody] Hechicero hechicero)
    {
        if (!ModelState.IsValid)
            return BadRequest("Envíe un hechicero válido");

        var updated = await _service.UpdateAsync(id, hechicero);
        if (!updated)
            return NotFound("El hechicero que quiere editar no existe");

        var (role, rank, name) = GetActorInfo();
        await _auditService.LogActionAsync("hechicero", "update", id, role, rank, name, $"Actualizado hechicero: {hechicero.Name}");

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteHechicero(int id)
    {
        var hechicero = await _service.GetByIdAsync(id);
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound("El hechicero que quiere eliminar no existe");

        var (role, rank, name) = GetActorInfo();
        await _auditService.LogActionAsync("hechicero", "delete", id, role, rank, name, $"Eliminado hechicero: {hechicero?.Name}");

        return NoContent();
    }
}
