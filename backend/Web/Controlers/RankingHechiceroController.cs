using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
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

    

[AllowAnonymous]
[HttpGet("top-por-nivel/pdf")]
public async Task<IActionResult> GetRankingPorNivelPdf([FromQuery] int ubicacionId)
{
    try
    {
        if (ubicacionId <= 0)
        {
            return BadRequest(new { error = "ubicacionId debe ser mayor a 0" });
        }

        var datos = await _service.GetTopHechicerosPorNivelYUbicacion(ubicacionId);
        
        if (datos == null || !datos.Any())
        {
            return NotFound(new { error = "No hay datos de ranking para la ubicación especificada" });
        }

        var document = new RankingHechicerosDocument(datos);

        var stream = new MemoryStream();
        document.GeneratePdf(stream);
        stream.Position = 0;

        return File(stream, "application/pdf", $"ranking-ubicacion-{ubicacionId}.pdf");
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { error = "Error generando PDF: " + ex.Message });
    }
}

}