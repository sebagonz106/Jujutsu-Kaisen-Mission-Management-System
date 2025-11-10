using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;
    public interface IMaldicionRepository
    {
        Task<List<Maldicion>> GetAllAsync();
        Task<List<Maldicion>> GetPagedAsync(int? cursor, int limit);
        Task<Maldicion?> GetByIdAsync(int id);
        Task<Maldicion> AddAsync(Maldicion maldicion);
        Task<bool> UpdateAsync(int id, Maldicion maldicion);
        Task<bool> DeleteAsync(int id);
    }
