using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService
{
    public interface IUbicacionService
    {
        Task<IEnumerable<Ubicacion>> GetAllAsync();
        Task<(IEnumerable<Ubicacion> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit);
        Task<Ubicacion?> GetByIdAsync(int id);
        Task<Ubicacion> AddAsync(Ubicacion ubicacion);
        Task<bool> DeleteAsync(int id);
        Task<Ubicacion?> UpdateAsync(int id, Ubicacion ubicacion);
    }
}
