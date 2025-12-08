using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.IService;

namespace GestionDeMisiones.Service;


public class MaldicionesEnEstadoService : IMaldicionesEnEstadosService
{
    private readonly IMaldicionesEnEstadoRepository _repository;

    public MaldicionesEnEstadoService(IMaldicionesEnEstadoRepository repository)
    {
        _repository = repository;
    }

    public Task<IEnumerable<MaldicionEnEstado>> ConsultarPorEstadoAsync(
        Maldicion.EEstadoActual estado)
    {
        return _repository.GetMaldicionesPorEstadoAsync(estado);
    }
}
