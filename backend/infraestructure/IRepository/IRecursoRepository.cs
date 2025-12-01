using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface IRecursoRepository
{
    Task<IEnumerable<Recurso>> GetAllAsync();
    Task<List<Recurso>> GetPagedAsync(int? cursor, int limit);
    Task<Recurso?> GetByIdAsync(int id);
    Task<Recurso> AddAsync(Recurso recurso);
    Task UpdateAsync(Recurso recurso);
    Task DeleteAsync(Recurso recurso);
}