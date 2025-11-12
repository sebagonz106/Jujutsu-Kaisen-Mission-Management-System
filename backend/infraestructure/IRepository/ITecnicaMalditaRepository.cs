using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface ITecnicaMalditaRepository
{
    Task<IEnumerable<TecnicaMaldita>> GetAllAsync();
    Task<List<TecnicaMaldita>> GetPagedAsync(int? cursor, int limit);
    Task<TecnicaMaldita?> GetByIdAsync(int id);
    Task<TecnicaMaldita> AddAsync(TecnicaMaldita tecnica);
    Task UpdateAsync(TecnicaMaldita tecnica);
    Task DeleteAsync(TecnicaMaldita tecnica);
}