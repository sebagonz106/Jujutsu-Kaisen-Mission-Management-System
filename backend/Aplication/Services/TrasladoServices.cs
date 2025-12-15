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
    private readonly IHechiceroRepository _hechiceroRepo;
    private readonly IPersonalDeApoyoRepository _personalRepo;

    public TrasladoService(
        ITrasladoRepository repo, 
        IHechiceroRepository hechiceroRepo,
        IPersonalDeApoyoRepository personalRepo)
    {
        _repo = repo;
        _hechiceroRepo = hechiceroRepo;
        _personalRepo = personalRepo;
    }

    public async Task<IEnumerable<Traslado>> GetAllAsync()
        => await _repo.GetAllAsync();

    public async Task<(IEnumerable<Traslado> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit)
    {
        var items = await _repo.GetPagedAsync(cursor, limit);
        var hasMore = items.Count > limit;
        
        if (hasMore)
            items = items.Take(limit).ToList();
        
        var nextCursor = hasMore ? items.LastOrDefault()?.Id : null;
        
        return (items, nextCursor, hasMore);
    }

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

    public async Task<bool> AgregarHechiceroAsync(int trasladoId, int hechiceroId)
    {
        var traslado = await _repo.GetByIdConRelacionesAsync(trasladoId);
        var hechicero = await _hechiceroRepo.GetByIdAsync(hechiceroId);
        
        if (traslado == null || hechicero == null) return false;
        
        return await _repo.AgregarHechiceroAsync(traslado, hechicero);
    }

    public async Task<bool> QuitarHechiceroAsync(int trasladoId, int hechiceroId)
    {
        var traslado = await _repo.GetByIdConRelacionesAsync(trasladoId);
        if (traslado == null) return false;
        
        return await _repo.QuitarHechiceroAsync(traslado, hechiceroId);
    }

    public async Task<bool> AgregarPersonalApoyoAsync(int trasladoId, int personalId)
    {
        var traslado = await _repo.GetByIdConRelacionesAsync(trasladoId);
        var personal = await _personalRepo.GetByIdAsync(personalId);
        
        if (traslado == null || personal == null) return false;
        
        return await _repo.AgregarPersonalApoyoAsync(traslado, personal);
    }

    public async Task<bool> QuitarPersonalApoyoAsync(int trasladoId, int personalId)
    {
        var traslado = await _repo.GetByIdConRelacionesAsync(trasladoId);
        if (traslado == null) return false;
        
        return await _repo.QuitarPersonalApoyoAsync(traslado, personalId);
    }

    public async Task<IEnumerable<Hechicero>> GetHechicerosEnTrasladoAsync(int trasladoId)
    {
        return await _repo.GetHechicerosEnTrasladoAsync(trasladoId);
    }

    public async Task<IEnumerable<PersonalDeApoyo>> GetPersonalApoyoEnTrasladoAsync(int trasladoId)
    {
        return await _repo.GetPersonalApoyoEnTrasladoAsync(trasladoId);
    }
}