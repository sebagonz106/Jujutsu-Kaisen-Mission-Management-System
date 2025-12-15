using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface ISubordinacionService
{
    Task<Subordinacion> GetByIdAsync(int id);
    Task<IEnumerable<Subordinacion>> GetAllAsync();
    Task<Subordinacion> CrearAsync(Subordinacion subordinacion);
    Task<Subordinacion> ActualizarAsync(int id, Subordinacion subordinacion);
    Task<bool> EliminarAsync(int id);
    Task<bool> ExisteRelacionActivaAsync(int maestroId, int discipuloId);
}