// TrasladoService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using GestionDeMisiones.IService;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service;
public class TrasladoService : ITrasladoService
{
    private readonly ITrasladoRepository _repo;
    public TrasladoService(ITrasladoRepository repo) => _repo = repo;

    public async Task<IEnumerable<Traslado>> GetAllAsync()
        => await _repo.GetAllAsync();

    public async Task<(IEnumerable<Traslado> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit)
    {
        limit = Math.Clamp(limit, 1, 100);
        var items = await _repo.GetPagedAsync(cursor, limit);
        var hasMore = items.Count > limit;
        if (hasMore) items = items.Take(limit).ToList();
        var nextCursor = hasMore && items.Count > 0 ? items[^1].Id : (int?)null;
        return (items, nextCursor, hasMore);
    }

    public async Task<Traslado> GetByIdAsync(int id)
        => await _repo.GetByIdAsync(id);

    public async Task<Traslado> CreateAsync(Traslado traslado)
    {
        return await _repo.AddWithHechicerosAsync(traslado, traslado.HechicerosIds);
    }

    public async Task<bool> UpdateAsync(int id, Traslado traslado)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return false;

        // Aplicar cambios permitidos
        existing.OrigenId = traslado.OrigenId;
        existing.DestinoId = traslado.DestinoId;
        existing.Fecha = traslado.Fecha;
        existing.Motivo = traslado.Motivo;
        existing.Estado = traslado.Estado;
        existing.MisionId = traslado.MisionId;

        await _repo.UpdateWithHechicerosAsync(existing, traslado.HechicerosIds);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return false;

        await _repo.DeleteAsync(existing);
        return true;
    }
}
