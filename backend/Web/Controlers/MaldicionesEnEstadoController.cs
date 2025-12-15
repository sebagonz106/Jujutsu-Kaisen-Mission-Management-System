using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.IService;
using QuestPDF.Fluent;
using GestionDeMisiones.Web;
using GestionDeMisiones.Models;

[ApiController]
[Route("api/[controller]")]

public class MaldicionConsultaController : ControllerBase
{
    private readonly IMaldicionesEnEstadosService _service;

    public MaldicionConsultaController(IMaldicionesEnEstadosService service)
    {
        _service = service;
    }

    [HttpGet("{estado}")]
    public async Task<ActionResult<IEnumerable<MaldicionEnEstado>>>GetPorEstado(
        Maldicion.EEstadoActual estado,
        [FromQuery] int? limit,
        [FromQuery] int? cursor)
    {
        if (limit.HasValue || cursor.HasValue)
        {
            var lim = limit ?? 20;
            var (items, nextCursor, hasMore) = await _service.ConsultarPorEstadoPagedAsync(estado, cursor, lim);
            return Ok(new { items, nextCursor, hasMore });
        }
        var result = await _service.ConsultarPorEstadoAsync(estado);
        return Ok(result);
    }

    [HttpGet("{estado}/pdf")]
public async Task<IActionResult> GetReportePdf(Maldicion.EEstadoActual estado)
{
    var maldiciones = await _service.ConsultarPorEstadoAsync(estado);

    var document = new MaldicionesEnEstadoDocument(maldiciones);

    var stream = new MemoryStream();
    document.GeneratePdf(stream);
    stream.Position = 0; // importante reiniciar la posición

    return File(stream, "application/pdf", $"maldiciones-{estado}.pdf");
}

}

