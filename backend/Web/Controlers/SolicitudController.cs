using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;

[ApiController]
[Route("api/[controller]")]
public class SolicitudController : ControllerBase
{
    private readonly ISolicitudService _service;

    public SolicitudController(ISolicitudService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Solicitud>>> GetAllSolicitud()
    {
        var solicitudes = await _service.GetAllAsync();
        return Ok(solicitudes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Solicitud>> GetSolicitudById(int id)
    {
        var solicitud = await _service.GetByIdAsync(id);
        if (solicitud == null)
            return NotFound("La solicitud que buscas no existe");
        return Ok(solicitud);
    }

    [HttpPost]
    public async Task<ActionResult<Solicitud>> NewSolicitud([FromBody] Solicitud solicitud)
    {
        if (!ModelState.IsValid)
            return BadRequest("Envíe una solicitud válida");

        try
        {
            var created = await _service.CreateAsync(solicitud);
            return CreatedAtAction(nameof(GetSolicitudById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutSolicitud(int id, [FromBody] Solicitud solicitud)
    {
        if (!ModelState.IsValid)
            return BadRequest("Envíe una solicitud válida");

        try
        {
            var updated = await _service.UpdateAsync(id, solicitud);
            if (!updated)
                return NotFound("La solicitud que quiere editar no existe");

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSolicitud(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound("La solicitud que quiere eliminar no existe");

        return NoContent();
    }
}