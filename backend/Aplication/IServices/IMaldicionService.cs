using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService
{
    public interface IMaldicionService
    {
        Task<List<Maldicion>> GetAllAsync();
        Task<(IEnumerable<Maldicion> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit);
        Task<Maldicion?> GetByIdAsync(int id);
        Task<Maldicion?> CreateAsync(Maldicion maldicion);
        Task<bool> UpdateAsync(int id, Maldicion maldicion);
        Task<bool> DeleteAsync(int id);
    }
}
