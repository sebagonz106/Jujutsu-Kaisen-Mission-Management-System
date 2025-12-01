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

    public async Task<(IEnumerable<Solicitud> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit)
    {
        if (limit <= 0) limit = 20;
        if (limit > 100) limit = 100;
        var list = await _solicitudRepo.GetPagedAsync(cursor, limit);
        var hasMore = list.Count > limit;
        if (hasMore) list.RemoveAt(list.Count - 1);
        int? nextCursor = list.Count > 0 ? list.Last().Id : null;
        return (list, nextCursor, hasMore);
    }

    public async Task<Solicitud?> GetByIdAsync(int id)
        => await _solicitudRepo.GetByIdAsync(id);

    public async Task<Solicitud> CreateAsync(Solicitud solicitud)
    {
        // Validaciones de negocio
        if (solicitud.MaldicionId <= 0)
            throw new ArgumentException("La maldición es obligatoria");

        // Validar que la maldición existe usando GetByIdAsync
        var maldicionExistente = await _maldicionRepo.GetByIdAsync(solicitud.MaldicionId);
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
        if (solicitud.MaldicionId <= 0)
            throw new ArgumentException("La maldición es obligatoria");

        // Validar que la maldición existe usando GetByIdAsync
        var maldicionExistente = await _maldicionRepo.GetByIdAsync(solicitud.MaldicionId);
        if (maldicionExistente == null)
            throw new ArgumentException("La maldición especificada no existe");

        if (!Enum.IsDefined(typeof(EEstadoSolicitud), solicitud.Estado))
            throw new ArgumentException("Estado de solicitud no válido");

        // Actualizar solo campos permitidos
        existing.MaldicionId = solicitud.MaldicionId;
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