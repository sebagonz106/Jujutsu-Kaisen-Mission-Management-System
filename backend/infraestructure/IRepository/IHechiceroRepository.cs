// Repositories/Interfaces/IHechiceroRepository.cs
using GestionDeMisiones.Models;
namespace GestionDeMisiones.IRepository;
public interface IHechiceroRepository
{
    Task<IEnumerable<Hechicero>> GetAllAsync();
    Task<Hechicero?> GetByIdAsync(int id);
    Task<Hechicero> AddAsync(Hechicero hechicero);
    Task UpdateAsync(Hechicero hechicero);
    Task DeleteAsync(Hechicero hechicero);
}
