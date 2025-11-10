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

    public async Task<Traslado> GetByIdAsync(int id)
        => await _repo.GetByIdAsync(id);

    public async Task<Traslado> CreateAsync(Traslado traslado)
    {

        return await _repo.AddAsync(traslado);
    }

    public async Task<bool> UpdateAsync(int id, Traslado traslado)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return false;

        // Aplicar cambios permitidos
        existing.Origen = traslado.Origen;
        existing.Destino = traslado.Destino;
        existing.Fecha = traslado.Fecha;
        existing.Motivo = traslado.Motivo;
        existing.Estado = traslado.Estado;

        await _repo.UpdateAsync(existing);
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
