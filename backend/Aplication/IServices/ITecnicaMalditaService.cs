using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface ITecnicaMalditaService
{
    Task<IEnumerable<TecnicaMaldita>> GetAllAsync();
    Task<(IEnumerable<TecnicaMaldita> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit);
    Task<TecnicaMaldita?> GetByIdAsync(int id);
    Task<TecnicaMaldita> CreateAsync(TecnicaMaldita tecnica);
    Task<bool> UpdateAsync(int id, TecnicaMaldita tecnica);
    Task<bool> DeleteAsync(int id);
}