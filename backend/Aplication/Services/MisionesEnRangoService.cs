using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using  GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service;

public class MisionesEnRangoService : IMisionesEnRangoService
{
    private readonly IMisionesEnRangoRepository _repo;

    public MisionesEnRangoService(IMisionesEnRangoRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<MisionEnRango>> GetMisionesCompletadasPorRango(
        DateTime desde, DateTime hasta)
    {
        return await _repo.GetMisionesCompletadasPorRango(desde, hasta);
    }

    public async Task<(IEnumerable<MisionEnRango> items, int? nextCursor, bool hasMore)> GetMisionesCompletadasPorRangoPagedAsync(
        DateTime desde, DateTime hasta, int? cursor, int limit)
    {
        var items = await _repo.GetMisionesCompletadasPorRangoPagedAsync(desde, hasta, cursor, limit);
        var hasMore = items.Count > limit;
        
        if (hasMore)
            items = items.Take(limit).ToList();
        
        var nextCursor = hasMore ? items.LastOrDefault()?.MisionId : null;
        
        return (items, nextCursor, hasMore);
    }
}
