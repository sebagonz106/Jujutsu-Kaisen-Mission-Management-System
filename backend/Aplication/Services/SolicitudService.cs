using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service;

public class SolicitudService : ISolicitudService
{
    private readonly ISolicitudRepository _solicitudRepo;
    private readonly IMaldicionRepository _maldicionRepo;

    public SolicitudService(ISolicitudRepository solicitudRepo, IMaldicionRepository maldicionRepo)
    {
        _solicitudRepo = solicitudRepo;
        _maldicionRepo = maldicionRepo;
    }

    public async Task<IEnumerable<Solicitud>> GetAllAsync()
        => await _solicitudRepo.GetAllAsync();

    public async Task<Solicitud?> GetByIdAsync(int id)
        => await _solicitudRepo.GetByIdAsync(id);

    public async Task<Solicitud> CreateAsync(Solicitud solicitud)
    {
        // Validaciones de negocio
        if (solicitud.Maldicion == null)
            throw new ArgumentException("La maldición es obligatoria");

        // Validar que la maldición existe usando GetByIdAsync (método que probablemente ya existe)
        var maldicionExistente = await _maldicionRepo.GetByIdAsync(solicitud.Maldicion.Id);
        if (maldicionExistente == null)
            throw new ArgumentException("La maldición especificada no existe");

        if (!Enum.IsDefined(typeof(EEstadoSolicitud), solicitud.Estado))
            throw new ArgumentException("Estado de solicitud no válido");

        return await _solicitudRepo.AddAsync(solicitud);
    }

    public async Task<bool> UpdateAsync(int id, Solicitud solicitud)
    {
        var existing = await _solicitudRepo.GetByIdAsync(id);
        if (existing == null)
            return false;

        // Validaciones de negocio
        if (solicitud.Maldicion == null)
            throw new ArgumentException("La maldición es obligatoria");

        // Validar que la maldición existe usando GetByIdAsync
        var maldicionExistente = await _maldicionRepo.GetByIdAsync(solicitud.Maldicion.Id);
        if (maldicionExistente == null)
            throw new ArgumentException("La maldición especificada no existe");

        if (!Enum.IsDefined(typeof(EEstadoSolicitud), solicitud.Estado))
            throw new ArgumentException("Estado de solicitud no válido");

        // Actualizar solo campos permitidos
        existing.Maldicion = solicitud.Maldicion;
        existing.Estado = solicitud.Estado;

        await _solicitudRepo.UpdateAsync(existing);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _solicitudRepo.GetByIdAsync(id);
        if (existing == null)
            return false;

        await _solicitudRepo.DeleteAsync(existing);
        return true;
    }
}