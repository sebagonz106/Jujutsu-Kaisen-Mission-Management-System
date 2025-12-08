using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.IService;
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
    public async Task<ActionResult<IEnumerable<MaldicionEnEstado>>>GetPorEstado(Maldicion.EEstadoActual estado)
    {
        var result = await _service.ConsultarPorEstadoAsync(estado);
        return Ok(result);
    }
}

