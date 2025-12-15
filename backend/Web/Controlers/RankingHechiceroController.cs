using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.IService;
using QuestPDF.Fluent;
using GestionDeMisiones.Web;

namespace GestionDeMisiones.Controllers;

    
[ApiController]
[Route("api/[controller]")]
public class RankingHechicerosController : ControllerBase
{
    private readonly IRankingHechiceroService _service;

    public RankingHechicerosController(IRankingHechiceroService service)
    {
        _service = service;
    }

    [HttpGet("top-por-nivel")]
    public async Task<IActionResult> GetRankingPorNivel([FromQuery] int ubicacionId)
    {
        var resultado = await _service.GetTopHechicerosPorNivelYUbicacionAsync(ubicacionId);
        return Ok(resultado);
    }

    


[HttpGet("top-por-nivel/pdf")]
public async Task<IActionResult> GetRankingPorNivelPdf([FromQuery] int ubicacionId)
{
    var datos = await _service.GetTopHechicerosPorNivelYUbicacion(ubicacionId);

    var document = new RankingHechicerosDocument(datos);

    var stream = new MemoryStream();
    document.GeneratePdf(stream);
    stream.Position = 0;

    return File(stream, "application/pdf", "ranking-hechiceros.pdf");
}

}