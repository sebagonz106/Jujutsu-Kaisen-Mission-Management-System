// ITrasladoService.cs

using GestionDeMisiones.Models;
namespace GestionDeMisiones.IService;
public interface ITrasladoService
{
    Task<IEnumerable<Traslado>> GetAllAsync();
    Task<Traslado> GetByIdAsync(int id);
    Task<Traslado> CreateAsync(Traslado traslado);
    Task<bool> UpdateAsync(int id, Traslado traslado);
    Task<bool> DeleteAsync(int id);
}
