using Microsoft.AspNetCore.Mvc;
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
    [HttpGet("efectividad-tecnicas/pdf")]
    public async Task<IActionResult> GetEfectividadTecnicasPdf()
    {
        var data = await _service.GetEfectividadTecnicasAsync();

        if (!data.Any())
            return NotFound("No hay datos para generar el reporte.");

        var document = new EfectividadTecnicasDocument(data);

        var stream = new MemoryStream();
        document.GeneratePdf(stream);
        stream.Position = 0;

        return File(stream, "application/pdf", "efectividad-tecnicas.pdf");
    }

}