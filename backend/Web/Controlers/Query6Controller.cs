using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GestionDeMisiones.IService;
using GestionDeMisiones.Models;
using GestionDeMisiones.Web;
using QuestPDF.Fluent;
[ApiController]
[Route("api/[controller]")]
public class Query6Controller : ControllerBase
{
    private readonly IQuery6Service _service;

    public Query6Controller(IQuery6Service service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Query6Result>>> GetRelacionHechiceroDiscipulos(
        [FromQuery] int? limit,
        [FromQuery] int? cursor)
    {
        if (limit.HasValue || cursor.HasValue)
        {
            var lim = limit ?? 20;
            var (items, nextCursor, hasMore) = await _service.GetRelacionHechiceroDiscipulosPagedAsync(cursor, lim);
            return Ok(new { items, nextCursor, hasMore });
        }
        var result = await _service.GetRelacionHechiceroDiscipulosAsync();
        return Ok(result);
    }
    [AllowAnonymous]
    [HttpGet("pdf")]
    public async Task<IActionResult> GetRelacionHechicerosPdf()
    {
        try
        {
            var data = await _service.GetRelacionHechiceroDiscipulosAsync();

            if (!data.Any())
                return NotFound(new { error = "No hay datos para generar el reporte." });

            var document = new RelacionHechicerosDocument(data);

            var stream = new MemoryStream();
            document.GeneratePdf(stream);
            stream.Position = 0;

            return File(stream, "application/pdf", "relacion-hechiceros.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error generando PDF: " + ex.Message });
        }
    }

}