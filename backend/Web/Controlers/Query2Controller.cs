using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.IService;
using GestionDeMisiones.Models;
using GestionDeMisiones.Web;
using QuestPDF.Fluent;

[ApiController]
[Route("api/[controller]")]
public class Query2Controller : ControllerBase
{
    private readonly IQuery2Service _service;

    public Query2Controller(IQuery2Service service)
    {
        _service = service;
    }

    [HttpGet("hechicero/{hechiceroId}")]
    public async Task<ActionResult<IEnumerable<Query2Result>>> GetMisionesPorHechicero(
        int hechiceroId,
        [FromQuery] int? limit,
        [FromQuery] int? cursor)
    {
        try
        {
            if (limit.HasValue || cursor.HasValue)
            {
                var lim = limit ?? 20;
                var (items, nextCursor, hasMore) = await _service.GetMisionesPorHechiceroPagedAsync(hechiceroId, cursor, lim);
                return Ok(new { items, nextCursor, hasMore });
            }
            var result = await _service.GetMisionesPorHechiceroAsync(hechiceroId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("hechicero/{hechiceroId}/pdf")]
public async Task<IActionResult> GetMisionesPorHechiceroPdf(int hechiceroId)
{
    var misiones = await _service.GetMisionesPorHechiceroAsync(hechiceroId);

    if (!misiones.Any())
        return NotFound("No se encontraron misiones para el hechicero.");

    // Puedes agregar un servicio para obtener el nombre del hechicero si lo deseas
    var hechiceroNombre = $"ID {hechiceroId}";

    var document = new MisionesPorHechiceroDocument(misiones, hechiceroNombre);

    var stream = new MemoryStream();
    document.GeneratePdf(stream);
    stream.Position = 0;

    return File(stream, "application/pdf", $"misiones-hechicero-{hechiceroId}.pdf");
}

}