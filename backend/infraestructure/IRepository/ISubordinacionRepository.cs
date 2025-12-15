using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface ISubordinacionRepository
{
    Task<Subordinacion?> GetByIdAsync(int id);
    Task<IEnumerable<Subordinacion>> GetAllAsync();
    Task<Subordinacion> AddAsync(Subordinacion subordinacion);
    Task UpdateAsync(Subordinacion subordinacion);
    Task DeleteAsync(Subordinacion subordinacion);
    Task<bool> ExisteRelacionActivaAsync(int maestroId, int discipuloId);
}