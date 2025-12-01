using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IRecursoService
{
    Task<IEnumerable<Recurso>> GetAllAsync();
    Task<(IEnumerable<Recurso> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit);
    Task<Recurso?> GetByIdAsync(int id);
    Task<Recurso> CreateAsync(Recurso recurso);
    Task<bool> UpdateAsync(int id, Recurso recurso);
    Task<bool> DeleteAsync(int id);
}