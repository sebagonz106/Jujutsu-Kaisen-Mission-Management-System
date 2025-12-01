using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface ITecnicaMalditaDominadaRepository
{
    Task<IEnumerable<TecnicaMalditaDominada>> GetAllAsync();
    Task<List<TecnicaMalditaDominada>> GetPagedAsync(int? cursor, int limit);
    Task<TecnicaMalditaDominada?> GetByIdAsync(int id);
    Task<TecnicaMalditaDominada> AddAsync(TecnicaMalditaDominada tecnicaDominada);
    Task UpdateAsync(TecnicaMalditaDominada tecnicaDominada);
    Task DeleteAsync(TecnicaMalditaDominada tecnicaDominada);
    Task<bool> ExistsAsync(int hechiceroId, int tecnicaMalditaId, int? excludeId = null);
}