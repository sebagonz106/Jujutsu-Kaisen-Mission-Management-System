using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IMisionesEnRangoService
{
    Task<IEnumerable<MisionEnRango>> GetMisionesCompletadasPorRango(
        DateTime desde, DateTime hasta);
    
    Task<(IEnumerable<MisionEnRango> items, int? nextCursor, bool hasMore)> GetMisionesCompletadasPorRangoPagedAsync(
        DateTime desde, DateTime hasta, int? cursor, int limit);
}
