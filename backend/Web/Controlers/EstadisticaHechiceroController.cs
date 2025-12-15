using Microsoft.AspNetCore.Mvc;
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
    public async Task<IActionResult> GetComparacion()
    {
        var datos = await _service.GetEfectividadMediosVsAltos();
        return Ok(datos);
    }

[HttpGet("efectividad-hechiceros/pdf")]
public async Task<IActionResult> GetReporteEfectividad()
{
    var data = await _service.GetEfectividadMediosVsAltos();

    var document = new EfectividadHechicerosDocument(data);

    // Crear un MemoryStream y generar el PDF allí
    var stream = new MemoryStream();
    document.GeneratePdf(stream);
    stream.Position = 0; // resetear la posición antes de enviar

    return File(stream, "application/pdf", "efectividad-hechiceros.pdf");
}

}
