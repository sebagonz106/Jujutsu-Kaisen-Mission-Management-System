using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GestionDeMisiones.IService;
using QuestPDF.Fluent;
using GestionDeMisiones.Web;

namespace GestionDeMisiones.Controllers;
[ApiController]
[Route("api/[controller]")]
public class MisionesEnRangoController : ControllerBase
{
    private readonly IMisionesEnRangoService _service;

    public MisionesEnRangoController(IMisionesEnRangoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] DateTime desde, 
        [FromQuery] DateTime hasta,
        [FromQuery] int? limit,
        [FromQuery] int? cursor)
    {
        if (limit.HasValue || cursor.HasValue)
        {
            var lim = limit ?? 20;
            var (items, nextCursor, hasMore) = await _service.GetMisionesCompletadasPorRangoPagedAsync(desde, hasta, cursor, lim);
            return Ok(new { items, nextCursor, hasMore });
        }
        var result = await _service.GetMisionesCompletadasPorRango(desde, hasta);
        return Ok(result);
    }

    [AllowAnonymous]
    [HttpGet("pdf")]
    public async Task<IActionResult> GetReportePdf([FromQuery] DateTime desde, [FromQuery] DateTime hasta)
    {
        try
        {
            var misiones = await _service.GetMisionesCompletadasPorRango(desde, hasta);

            if (!misiones.Any())
                return NotFound(new { error = "No hay misiones en el rango especificado." });

            var document = new MisionesEnRangoDocument(misiones);

            var stream = new MemoryStream();
            document.GeneratePdf(stream);
            stream.Position = 0;

            return File(stream, "application/pdf", "misiones-en-rango.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error generando PDF: " + ex.Message });
        }
    }

}
