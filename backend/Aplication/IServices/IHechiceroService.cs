// Services/Interfaces/IHechiceroService.cs
using GestionDeMisiones.Models;
namespace  GestionDeMisiones.IService;
public interface IHechiceroService
{
    Task<IEnumerable<Hechicero>> GetAllAsync();
    Task<(IEnumerable<Hechicero> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit);
    Task<Hechicero?> GetByIdAsync(int id);
    Task<Hechicero> CreateAsync(Hechicero hechicero);
    Task<bool> UpdateAsync(int id, Hechicero hechicero);
    Task<bool> DeleteAsync(int id);
}
