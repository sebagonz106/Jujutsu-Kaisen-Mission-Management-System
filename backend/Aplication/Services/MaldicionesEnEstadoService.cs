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

    public async Task<(IEnumerable<MaldicionEnEstado> items, int? nextCursor, bool hasMore)> ConsultarPorEstadoPagedAsync(
        Maldicion.EEstadoActual estado, int? cursor, int limit)
    {
        var items = await _repository.GetMaldicionesPorEstadoPagedAsync(estado, cursor, limit);
        var hasMore = items.Count > limit;
        
        if (hasMore)
            items = items.Take(limit).ToList();
        
        var nextCursor = hasMore ? items.LastOrDefault()?.Id : null;
        
        return (items, nextCursor, hasMore);
    }
}
