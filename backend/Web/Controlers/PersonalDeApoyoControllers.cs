using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;

[ApiController]
[Route("api/[controller]")]
public class PersonalDeApoyoController : ControllerBase
{
    private readonly IPersonalDeApoyoService _service;

    public PersonalDeApoyoController(IPersonalDeApoyoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PersonalDeApoyo>>> GetPersonalDeApoyo()
    {
        var personal = await _service.GetAllAsync();
        return Ok(personal);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PersonalDeApoyo>> GetPersonalDeApoyoById(int id)
    {
        var personal = await _service.GetByIdAsync(id);
        if (personal == null)
            return NotFound("El personal de apoyo que busca no se encuentra");
        return Ok(personal);
    }

    [HttpPost]
    public async Task<ActionResult<PersonalDeApoyo>> PostPersonalDeApoyo([FromBody] PersonalDeApoyo personal)
    {
        if (!ModelState.IsValid)
            return BadRequest("Envíe un personal de apoyo válido");

        try
        {
            var created = await _service.CreateAsync(personal);
            return CreatedAtAction(nameof(GetPersonalDeApoyoById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutPersonalDeApoyo(int id, [FromBody] PersonalDeApoyo personal)
    {
        if (!ModelState.IsValid)
            return BadRequest("Envíe un personal de apoyo válido");

        try
        {
            var updated = await _service.UpdateAsync(id, personal);
            if (!updated)
                return NotFound("El personal de apoyo que quiere editar no existe");

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePersonalDeApoyo(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound("El personal que quiere eliminar no existe");

        return NoContent();
    }
}