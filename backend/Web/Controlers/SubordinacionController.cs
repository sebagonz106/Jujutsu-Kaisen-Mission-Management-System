using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;

[ApiController]
[Route("api/[controller]")]
public class SubordinacionController : ControllerBase
{
    private readonly ISubordinacionService _service;

    public SubordinacionController(ISubordinacionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Subordinacion>>> GetAll()
    {
        var subordinaciones = await _service.GetAllAsync();
        return Ok(subordinaciones);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Subordinacion>> GetById(int id)
    {
        try
        {
            var subordinacion = await _service.GetByIdAsync(id);
            return Ok(subordinacion);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost]
    public async Task<ActionResult<Subordinacion>> Crear([FromBody] Subordinacion subordinacion)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var creada = await _service.CrearAsync(subordinacion);
            return CreatedAtAction(nameof(GetById), new { id = creada.Id }, creada);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] Subordinacion subordinacion)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var actualizada = await _service.ActualizarAsync(id, subordinacion);
            return Ok(actualizada);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        try
        {
            await _service.EliminarAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("existe/{maestroId}/{discipuloId}")]
    public async Task<ActionResult<bool>> ExisteRelacionActiva(int maestroId, int discipuloId)
    {
        var existe = await _service.ExisteRelacionActivaAsync(maestroId, discipuloId);
        return Ok(existe);
    }
}