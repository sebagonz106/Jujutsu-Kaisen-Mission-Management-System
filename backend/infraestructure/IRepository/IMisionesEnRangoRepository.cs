using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface IMisionesEnRangoRepository
{
    Task<IEnumerable<MisionEnRango>> GetMisionesCompletadasPorRango(
        DateTime desde, 
        DateTime hasta
    );
    
    Task<List<MisionEnRango>> GetMisionesCompletadasPorRangoPagedAsync(
        DateTime desde, 
        DateTime hasta,
        int? cursor,
        int limit
    );
}
