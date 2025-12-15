using Microsoft.AspNetCore.Mvc;
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
    public async Task<ActionResult<IEnumerable<Query6Result>>> GetRelacionHechiceroDiscipulos()
    {
        var result = await _service.GetRelacionHechiceroDiscipulosAsync();
        return Ok(result);
    }
    [HttpGet("pdf")]
    public async Task<IActionResult> GetRelacionHechicerosPdf()
    {
        var data = await _service.GetRelacionHechiceroDiscipulosAsync();

        if (!data.Any())
            return NotFound("No hay datos para generar el reporte.");

        var document = new RelacionHechicerosDocument(data);

        var stream = new MemoryStream();
        document.GeneratePdf(stream);
        stream.Position = 0;

        return File(stream, "application/pdf", "relacion-hechiceros.pdf");
    }

}