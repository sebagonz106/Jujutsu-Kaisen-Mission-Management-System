using GestionDeMisiones.IService;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;


namespace GestionDeMisiones.Service;



public class EstadisticasHechiceroService : IEstadisticasHechiceroService
{
    private readonly IEstadisticasHechiceroRepository _repo;

    public EstadisticasHechiceroService(IEstadisticasHechiceroRepository repo)
    {
        _repo = repo;
    }

    public Task<IEnumerable<EstadisticaHechicero>> GetEfectividadMediosVsAltos()
        => _repo.GetEfectividadMediosVsAltos();

    public async Task<(IEnumerable<EstadisticaHechicero> items, int? nextCursor, bool hasMore)> GetEfectividadMediosVsAltosPagedAsync(
        int? cursor, int limit)
    {
        var items = await _repo.GetEfectividadMediosVsAltosPagedAsync(cursor, limit);
        var hasMore = items.Count > limit;
        
        if (hasMore)
            items = items.Take(limit).ToList();
        
        var nextCursor = hasMore ? items.LastOrDefault()?.HechiceroId : null;
        
        return (items, nextCursor, hasMore);
    }
}