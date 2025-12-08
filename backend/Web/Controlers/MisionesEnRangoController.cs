using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;

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
}
