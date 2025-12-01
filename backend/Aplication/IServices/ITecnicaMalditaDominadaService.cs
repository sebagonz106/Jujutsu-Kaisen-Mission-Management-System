using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface ITecnicaMalditaDominadaService
{
    Task<IEnumerable<TecnicaMalditaDominada>> GetAllAsync();
    Task<(IEnumerable<TecnicaMalditaDominada> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit);
    Task<TecnicaMalditaDominada?> GetByIdAsync(int id);
    Task<TecnicaMalditaDominada> CreateAsync(TecnicaMalditaDominada tecnicaDominada);
    Task<bool> UpdateAsync(int id, TecnicaMalditaDominada tecnicaDominada);
    Task<bool> DeleteAsync(int id);
}