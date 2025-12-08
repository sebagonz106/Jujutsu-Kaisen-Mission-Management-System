using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.IService;



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
}
