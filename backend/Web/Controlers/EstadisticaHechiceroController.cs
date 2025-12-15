using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GestionDeMisiones.IService;
using QuestPDF.Fluent;
using GestionDeMisiones.Web;

namespace GestionDeMisiones.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EstadisticasHechiceroController : ControllerBase
{
    private readonly IEstadisticasHechiceroService _service;

    public EstadisticasHechiceroController(IEstadisticasHechiceroService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetComparacion(
        [FromQuery] int? limit,
        [FromQuery] int? cursor)
    {
        if (limit.HasValue || cursor.HasValue)
        {
            var lim = limit ?? 20;
            var (items, nextCursor, hasMore) = await _service.GetEfectividadMediosVsAltosPagedAsync(cursor, lim);
            return Ok(new { items, nextCursor, hasMore });
        }
        var datos = await _service.GetEfectividadMediosVsAltos();
        return Ok(datos);
    }

[AllowAnonymous]
[HttpGet("pdf")]
public async Task<IActionResult> GetReporteEfectividad()
{
    try
    {
        var data = await _service.GetEfectividadMediosVsAltos();

        if (!data.Any())
            return NotFound(new { error = "No hay datos para generar el reporte." });

        var document = new EfectividadHechicerosDocument(data);

        var stream = new MemoryStream();
        document.GeneratePdf(stream);
        stream.Position = 0;

        return File(stream, "application/pdf", "efectividad-hechiceros.pdf");
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { error = "Error generando PDF: " + ex.Message });
    }
}

}
