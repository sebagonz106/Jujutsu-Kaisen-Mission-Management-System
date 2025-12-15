using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GestionDeMisiones.IService;
using GestionDeMisiones.Models;
using GestionDeMisiones.Web;
using QuestPDF.Fluent;

[ApiController]
[Route("api/[controller]")]
public class Query4Controller : ControllerBase
{
    private readonly IQuery4Service _service;

    public Query4Controller(IQuery4Service service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Query4Result>>> GetEfectividadTecnicas(
        [FromQuery] int? limit,
        [FromQuery] int? cursor)
    {
        if (limit.HasValue || cursor.HasValue)
        {
            var lim = limit ?? 20;
            var (items, nextCursor, hasMore) = await _service.GetEfectividadTecnicasPagedAsync(cursor, lim);
            return Ok(new { items, nextCursor, hasMore });
        }
        var result = await _service.GetEfectividadTecnicasAsync();
        return Ok(result);
    }
    
    [AllowAnonymous]
    [HttpGet("pdf")]
    public async Task<IActionResult> GetEfectividadTecnicasPdf()
    {
        try
        {
            var data = await _service.GetEfectividadTecnicasAsync();

            if (!data.Any())
                return NotFound(new { error = "No hay datos para generar el reporte." });

            var document = new EfectividadTecnicasDocument(data);

            var stream = new MemoryStream();
            document.GeneratePdf(stream);
            stream.Position = 0;

            return File(stream, "application/pdf", "efectividad-tecnicas.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error generando PDF: " + ex.Message });
        }
    }

}