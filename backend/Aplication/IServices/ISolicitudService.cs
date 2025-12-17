using GestionDeMisiones.Models;
using GestionDeMisiones.DTOs;

namespace GestionDeMisiones.IService;

public interface ISolicitudService
{
    Task<IEnumerable<Solicitud>> GetAllAsync();
    Task<(IEnumerable<Solicitud> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit);
    Task<Solicitud?> GetByIdAsync(int id);
    Task<Solicitud> CreateAsync(Solicitud solicitud);
    // Sobrecarga: UpdateAsync con DTO para la lógica de cascada
    Task<(bool success, string message, dynamic? generatedData)> UpdateAsync(int id, SolicitudUpdateRequest request);
    Task<bool> DeleteAsync(int id);
    // Obtiene detalles del hechicero encargado y urgencia de una solicitud
    Task<dynamic?> GetHechiceroEncargadoDetailAsync(int solicitudId);
}