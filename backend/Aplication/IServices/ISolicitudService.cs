using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface ISolicitudService
{
    Task<IEnumerable<Solicitud>> GetAllAsync();
    Task<Solicitud?> GetByIdAsync(int id);
    Task<Solicitud> CreateAsync(Solicitud solicitud);
    Task<bool> UpdateAsync(int id, Solicitud solicitud);
    Task<bool> DeleteAsync(int id);
}