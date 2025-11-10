// Repositories/Interfaces/IHechiceroRepository.cs
using GestionDeMisiones.Models;
namespace GestionDeMisiones.IRepository;
public interface IHechiceroRepository
{
    Task<IEnumerable<Hechicero>> GetAllAsync();
    Task<List<Hechicero>> GetPagedAsync(int? cursor, int limit);
    Task<Hechicero?> GetByIdAsync(int id);
    Task<Hechicero> AddAsync(Hechicero hechicero);
    Task UpdateAsync(Hechicero hechicero);
    Task DeleteAsync(Hechicero hechicero);
}
