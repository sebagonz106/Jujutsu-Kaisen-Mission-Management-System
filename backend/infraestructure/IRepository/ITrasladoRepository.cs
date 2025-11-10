// ITrasladoRepository.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using GestionDeMisiones.Models;
namespace GestionDeMisiones.IRepository;
public interface ITrasladoRepository
{
    Task<IEnumerable<Traslado>> GetAllAsync();
    Task<Traslado> GetByIdAsync(int id);
    Task<Traslado> AddAsync(Traslado traslado);
    Task UpdateAsync(Traslado traslado);
    Task DeleteAsync(Traslado traslado);
}
