// TrasladoController.cs
using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.IService;
using GestionDeMisiones.Models;
[ApiController]
[Route("api/[controller]")]
public class TrasladoController : ControllerBase
{
    private readonly ITrasladoService _service;
    public TrasladoController(ITrasladoService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Traslado>>> GetAllTransport()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Traslado>> GetTrasladoById(int id)
    {
        var traslado = await _service.GetByIdAsync(id);
        if (traslado == null) return NotFound("El Traslado Solicitado no Existe");
        return Ok(traslado);
    }

    [HttpPost]
    public async Task<ActionResult<Traslado>> PostTraslado([FromBody] Traslado traslado)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var created = await _service.CreateAsync(traslado);
            return CreatedAtAction(nameof(GetTrasladoById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutTraslado(int id, [FromBody] Traslado traslado)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var updated = await _service.UpdateAsync(id, traslado);
        if (!updated) return NotFound("El traslado que quiere modificar no existe");
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTraslado(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound("El Traslado que intento eliminar no existe");
        return NoContent();
    }

    [HttpGet("{id}/hechiceros")]
    public async Task<ActionResult<IEnumerable<Hechicero>>> GetHechicerosEnTraslado(int id)
    {
        var hechiceros = await _service.GetHechicerosEnTrasladoAsync(id);
        return Ok(hechiceros);
    }

    [HttpGet("{id}/personal-apoyo")]
    public async Task<ActionResult<IEnumerable<PersonalDeApoyo>>> GetPersonalApoyoEnTraslado(int id)
    {
        var personal = await _service.GetPersonalApoyoEnTrasladoAsync(id);
        return Ok(personal);
    }

    [HttpPost("{id}/hechiceros/{hechiceroId}")]
    public async Task<IActionResult> AgregarHechiceroATraslado(int id, int hechiceroId)
    {
        var resultado = await _service.AgregarHechiceroAsync(id, hechiceroId);
        if (!resultado) return NotFound("No se pudo agregar el hechicero al traslado");
        return NoContent();
    }

    [HttpDelete("{id}/hechiceros/{hechiceroId}")]
    public async Task<IActionResult> QuitarHechiceroDeTraslado(int id, int hechiceroId)
    {
        var resultado = await _service.QuitarHechiceroAsync(id, hechiceroId);
        if (!resultado) return NotFound("No se pudo quitar el hechicero del traslado");
        return NoContent();
    }

    [HttpPost("{id}/personal-apoyo/{personalId}")]
    public async Task<IActionResult> AgregarPersonalApoyoATraslado(int id, int personalId)
    {
        var resultado = await _service.AgregarPersonalApoyoAsync(id, personalId);
        if (!resultado) return NotFound("No se pudo agregar el personal de apoyo al traslado");
        return NoContent();
    }

    [HttpDelete("{id}/personal-apoyo/{personalId}")]
    public async Task<IActionResult> QuitarPersonalApoyoDeTraslado(int id, int personalId)
    {
        var resultado = await _service.QuitarPersonalApoyoAsync(id, personalId);
        if (!resultado) return NotFound("No se pudo quitar el personal de apoyo del traslado");
        return NoContent();
    }
}