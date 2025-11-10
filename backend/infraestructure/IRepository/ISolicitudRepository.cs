using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface ISolicitudRepository
{
    Task<IEnumerable<Solicitud>> GetAllAsync();
    Task<Solicitud?> GetByIdAsync(int id);
    Task<Solicitud> AddAsync(Solicitud solicitud);
    Task UpdateAsync(Solicitud solicitud);
    Task DeleteAsync(Solicitud solicitud);
}