using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;

[ApiController]
[Route("api/[controller]")]
public class MisionController : ControllerBase
{
    private readonly IMisionService _service;

    public MisionController(IMisionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllMision([FromQuery] int? limit, [FromQuery] int? cursor)
    {
        // If pagination params are provided, return paginated shape
        if (limit.HasValue || cursor.HasValue)
        {
            var lim = limit ?? 20;
            var (items, nextCursor, hasMore) = await _service.GetPagedAsync(cursor, lim);
            return Ok(new { items, nextCursor, hasMore });
        }

        var misiones = await _service.GetAllAsync();
        return Ok(misiones);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Mision>> GetMision(int id)
    {
        var mision = await _service.GetByIdAsync(id);
        if (mision == null)
            return NotFound("La misión que buscas no existe");
        return Ok(mision);
    }

    [HttpPost]
    public async Task<ActionResult<Mision>> PostMision([FromBody] Mision mision)
    {
        if (!ModelState.IsValid)
            return BadRequest("La misión no cumple el formato");

        try
        {
            var created = await _service.CreateAsync(mision);
            return CreatedAtAction(nameof(GetMision), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutMision(int id, [FromBody] Mision mision)
    {
        if (!ModelState.IsValid)
            return BadRequest("La misión no cumple el formato");

        try
        {
            var updated = await _service.UpdateAsync(id, mision);
            if (!updated)
                return NotFound("La misión que quiere modificar no existe");

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMision(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound("La misión que quiere eliminar no existe");

        return NoContent();
    }
}