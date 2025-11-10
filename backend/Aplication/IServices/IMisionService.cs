using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IMisionService
{
    Task<IEnumerable<Mision>> GetAllAsync();
    Task<Mision?> GetByIdAsync(int id);
    Task<Mision> CreateAsync(Mision mision);
    Task<bool> UpdateAsync(int id, Mision mision);
    Task<bool> DeleteAsync(int id);
}