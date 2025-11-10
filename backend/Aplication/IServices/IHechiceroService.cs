// Services/Interfaces/IHechiceroService.cs
using GestionDeMisiones.Models;
namespace  GestionDeMisiones.IService;
public interface IHechiceroService
{
    Task<IEnumerable<Hechicero>> GetAllAsync();
    Task<Hechicero?> GetByIdAsync(int id);
    Task<Hechicero> CreateAsync(Hechicero hechicero);
    Task<bool> UpdateAsync(int id, Hechicero hechicero);
    Task<bool> DeleteAsync(int id);
}
