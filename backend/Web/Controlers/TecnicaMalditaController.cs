using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;

[ApiController]
[Route("api/[controller]")]
public class TecnicaMalditaController : ControllerBase
{
    private readonly ITecnicaMalditaService _service;

    public TecnicaMalditaController(ITecnicaMalditaService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TecnicaMaldita>>> GetAllTecnicaMaldita()
    {
        var tecnicas = await _service.GetAllAsync();
        return Ok(tecnicas);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TecnicaMaldita>> GetTecnicaMaldita(int id)
    {
        var tecnica = await _service.GetByIdAsync(id);
        if (tecnica == null)
            return NotFound("La técnica maldita que buscas no existe");
        return Ok(tecnica);
    }

    [HttpPost]
    public async Task<ActionResult<TecnicaMaldita>> PostTecnicaMaldita([FromBody] TecnicaMaldita tecnica)
    {
        if (!ModelState.IsValid)
            return BadRequest("La técnica maldita no cumple el formato");

        try
        {
            var created = await _service.CreateAsync(tecnica);
            return CreatedAtAction(nameof(GetTecnicaMaldita), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutTecnicaMaldita(int id, [FromBody] TecnicaMaldita tecnica)
    {
        if (!ModelState.IsValid)
            return BadRequest("La técnica maldita no cumple el formato");

        try
        {
            var updated = await _service.UpdateAsync(id, tecnica);
            if (!updated)
                return NotFound("La técnica maldita que quiere modificar no existe");

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTecnicaMaldita(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound("La técnica maldita que quiere eliminar no existe");

        return NoContent();
    }
}