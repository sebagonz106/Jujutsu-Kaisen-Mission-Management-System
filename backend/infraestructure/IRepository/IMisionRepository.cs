using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface IMisionRepository
{
    Task<IEnumerable<Mision>> GetAllAsync();
    Task<Mision?> GetByIdAsync(int id);
    Task<Mision> AddAsync(Mision mision);
    Task UpdateAsync(Mision mision);
    Task DeleteAsync(Mision mision);
}