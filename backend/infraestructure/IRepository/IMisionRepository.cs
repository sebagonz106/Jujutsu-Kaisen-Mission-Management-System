using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface IMisionRepository
{
    Task<IEnumerable<Mision>> GetAllAsync();
    Task<List<Mision>> GetPagedAsync(int? cursor, int limit);
    Task<Mision?> GetByIdAsync(int id);
    Task<Mision> AddAsync(Mision mision);
    Task UpdateAsync(Mision mision);
    Task DeleteAsync(Mision mision);
}