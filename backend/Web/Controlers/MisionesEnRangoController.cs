using Microsoft.AspNetCore.Mvc;
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
    public async Task<IActionResult> Get([FromQuery] DateTime desde, [FromQuery] DateTime hasta)
    {
        var result = await _service.GetMisionesCompletadasPorRango(desde, hasta);
        return Ok(result);
    }

    [HttpGet("pdf")]
public async Task<IActionResult> GetReportePdf([FromQuery] DateTime desde, [FromQuery] DateTime hasta)
{
    var misiones = await _service.GetMisionesCompletadasPorRango(desde, hasta);

    var document = new MisionesEnRangoDocument(misiones);

    var stream = new MemoryStream();
    document.GeneratePdf(stream);
    stream.Position = 0; // importante reiniciar la posición

    return File(stream, "application/pdf", "misiones-en-rango.pdf");
}

}
