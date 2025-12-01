// ITrasladoRepository.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using GestionDeMisiones.Models;
namespace GestionDeMisiones.IRepository;
public interface ITrasladoRepository
{
    Task<IEnumerable<Traslado>> GetAllAsync();
    Task<List<Traslado>> GetPagedAsync(int? cursor, int limit);
    Task<Traslado> GetByIdAsync(int id);
    Task<Traslado> AddAsync(Traslado traslado);
    Task<Traslado> AddWithHechicerosAsync(Traslado traslado, List<int>? hechicerosIds);
    Task UpdateWithHechicerosAsync(Traslado traslado, List<int>? hechicerosIds);
    Task UpdateAsync(Traslado traslado);
    Task DeleteAsync(Traslado traslado);
}
