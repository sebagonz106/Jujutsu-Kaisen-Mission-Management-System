using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IMisionService
{
    Task<IEnumerable<Mision>> GetAllAsync();
    Task<(IEnumerable<Mision> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit);
    Task<Mision?> GetByIdAsync(int id);
    Task<Mision> CreateAsync(Mision mision);
    Task<bool> UpdateAsync(int id, Mision mision);
    Task<bool> DeleteAsync(int id);
}