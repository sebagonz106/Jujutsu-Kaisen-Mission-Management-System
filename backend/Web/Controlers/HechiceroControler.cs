// Controllers/HechiceroController.cs
using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;

[ApiController]
[Route("api/[controller]")]
public class HechiceroController : ControllerBase
{
    private readonly IHechiceroService _service;

    public HechiceroController(IHechiceroService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Hechicero>>> GetAllHechicero()
    {
        var hechiceros = await _service.GetAllAsync();
        return Ok(hechiceros);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Hechicero>> GetHechiceroById(int id)
    {
        var hechicero = await _service.GetByIdAsync(id);
        if (hechicero == null)
            return NotFound("El hechicero que buscas no existe");
        return Ok(hechicero);
    }

    [HttpPost]
    public async Task<ActionResult<Hechicero>> NewHechicero([FromBody] Hechicero hechicero)
    {
        if (!ModelState.IsValid)
            return BadRequest("Envíe un hechicero válido");

        try
        {
            var created = await _service.CreateAsync(hechicero);
            return CreatedAtAction(nameof(GetHechiceroById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutHechicero(int id, [FromBody] Hechicero hechicero)
    {
        if (!ModelState.IsValid)
            return BadRequest("Envíe un hechicero válido");

        var updated = await _service.UpdateAsync(id, hechicero);
        if (!updated)
            return NotFound("El hechicero que quiere editar no existe");

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHechicero(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound("El hechicero que quiere eliminar no existe");

        return NoContent();
    }
}
