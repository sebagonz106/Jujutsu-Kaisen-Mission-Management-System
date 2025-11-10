using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;

[ApiController]
[Route("api/[controller]")]
public class RecursoController : ControllerBase
{
    private readonly IRecursoService _service;

    public RecursoController(IRecursoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Recurso>>> GetAllRecurso()
    {
        var recursos = await _service.GetAllAsync();
        return Ok(recursos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Recurso>> GetRecurso(int id)
    {
        var recurso = await _service.GetByIdAsync(id);
        if (recurso == null)
            return NotFound("El recurso que buscas no existe");
        return Ok(recurso);
    }

    [HttpPost]
    public async Task<ActionResult<Recurso>> PostRecurso([FromBody] Recurso recurso)
    {
        if (!ModelState.IsValid)
            return BadRequest("El recurso no cumple el formato");

        try
        {
            var created = await _service.CreateAsync(recurso);
            return CreatedAtAction(nameof(GetRecurso), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutRecurso(int id, [FromBody] Recurso recurso)
    {
        if (!ModelState.IsValid)
            return BadRequest("El recurso no cumple el formato");

        try
        {
            var updated = await _service.UpdateAsync(id, recurso);
            if (!updated)
                return NotFound("El recurso que quiere modificar no existe");

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecurso(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound("El recurso que quiere eliminar no existe");

        return NoContent();
    }
}