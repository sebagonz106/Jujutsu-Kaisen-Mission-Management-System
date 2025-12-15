using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
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

    [AllowAnonymous]
    [HttpGet("{estado}/pdf")]
    public async Task<IActionResult> GetReportePdf(Maldicion.EEstadoActual estado)
    {
        try
        {
            var maldiciones = await _service.ConsultarPorEstadoAsync(estado);

            if (!maldiciones.Any())
                return NotFound(new { error = "No hay maldiciones en el estado especificado." });

            var document = new MaldicionesEnEstadoDocument(maldiciones);

            var stream = new MemoryStream();
            document.GeneratePdf(stream);
            stream.Position = 0;

            return File(stream, "application/pdf", $"maldiciones-{estado}.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error generando PDF: " + ex.Message });
        }
    }

}

