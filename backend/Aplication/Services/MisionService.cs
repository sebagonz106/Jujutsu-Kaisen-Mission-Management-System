using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service;

public class MisionService : IMisionService
{
    private readonly IMisionRepository _misionRepo;
    private readonly IUbicacionRepository _ubicacionRepo;

    public MisionService(IMisionRepository misionRepo, IUbicacionRepository ubicacionRepo)
    {
        _misionRepo = misionRepo;
        _ubicacionRepo = ubicacionRepo;
    }

    public async Task<IEnumerable<Mision>> GetAllAsync()
        => await _misionRepo.GetAllAsync();

    public async Task<(IEnumerable<Mision> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit)
    {
        if (limit <= 0) limit = 20;
        if (limit > 100) limit = 100;
        var list = await _misionRepo.GetPagedAsync(cursor, limit);
        var hasMore = list.Count > limit;
        if (hasMore) list.RemoveAt(list.Count - 1); // remove extra
        int? nextCursor = list.Count > 0 ? list.Last().Id : null;
        return (list, nextCursor, hasMore);
    }

    public async Task<Mision?> GetByIdAsync(int id)
        => await _misionRepo.GetByIdAsync(id);

    public async Task<Mision> CreateAsync(Mision mision)
    {
        // Validaciones de negocio
        if (mision.FechaYHoraDeFin.HasValue && 
            mision.FechaYHoraDeFin <= mision.FechaYHoraDeInicio)
            throw new ArgumentException("La fecha de fin debe ser posterior a la de inicio");

        // Validar que la ubicación existe usando GetByIdAsync
        var ubicacionExistente = await _ubicacionRepo.GetByIdAsync(mision.UbicacionId);
        if (ubicacionExistente == null)
            throw new ArgumentException("La ubicación especificada no existe");

        return await _misionRepo.AddAsync(mision);
    }

    public async Task<bool> UpdateAsync(int id, Mision mision)
    {
        var existing = await _misionRepo.GetByIdAsync(id);
        if (existing == null)
            return false;

        // Validar que la ubicación existe usando GetByIdAsync
        var ubicacionExistente = await _ubicacionRepo.GetByIdAsync(mision.UbicacionId);
        if (ubicacionExistente == null)
            throw new ArgumentException("La ubicación especificada no existe");

        // Validación de fechas
        if (mision.FechaYHoraDeFin.HasValue && 
            mision.FechaYHoraDeFin <= mision.FechaYHoraDeInicio)
            throw new ArgumentException("La fecha de fin debe ser posterior a la de inicio");

        // Actualizar solo campos permitidos
        existing.FechaYHoraDeInicio = mision.FechaYHoraDeInicio;
        existing.FechaYHoraDeFin = mision.FechaYHoraDeFin;
        existing.UbicacionId = mision.UbicacionId;
        existing.Estado = mision.Estado;
        existing.EventosOcurridos = mision.EventosOcurridos;
        existing.DannosColaterales = mision.DannosColaterales;
        existing.NivelUrgencia = mision.NivelUrgencia;

        await _misionRepo.UpdateAsync(existing);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _misionRepo.GetByIdAsync(id);
        if (existing == null)
            return false;

        await _misionRepo.DeleteAsync(existing);
        return true;
    }
}