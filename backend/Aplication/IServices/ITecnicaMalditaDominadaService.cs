using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface ITecnicaMalditaDominadaService
{
    Task<IEnumerable<TecnicaMalditaDominada>> GetAllAsync();
    Task<TecnicaMalditaDominada?> GetByIdAsync(int id);
    Task<TecnicaMalditaDominada> CreateAsync(TecnicaMalditaDominada tecnicaDominada);
    Task<bool> UpdateAsync(int id, TecnicaMalditaDominada tecnicaDominada);
    Task<bool> DeleteAsync(int id);
}