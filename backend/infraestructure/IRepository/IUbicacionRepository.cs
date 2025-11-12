using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository
{
    public interface IUbicacionRepository
    {
        Task<IEnumerable<Ubicacion>> GetAllAsync();
        Task<List<Ubicacion>> GetPagedAsync(int? cursor, int limit);
        Task<Ubicacion?> GetByIdAsync(int id);
        Task<Ubicacion> AddAsync(Ubicacion ubicacion);
        Task<bool> DeleteAsync(int id);
        Task<Ubicacion?> UpdateAsync(int id, Ubicacion ubicacion);
    }
}
