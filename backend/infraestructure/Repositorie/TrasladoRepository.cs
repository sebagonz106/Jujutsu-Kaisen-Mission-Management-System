// TrasladoRepository.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Data;
namespace GestionDeMisiones.Repository;
public class TrasladoRepository : ITrasladoRepository
{
    private readonly AppDbContext _context;
    public TrasladoRepository(AppDbContext context) => _context = context;

    public async Task<IEnumerable<Traslado>> GetAllAsync()
        => await _context.Traslados.ToListAsync();

    public async Task<List<Traslado>> GetPagedAsync(int? cursor, int limit)
    {
        var query = _context.Traslados.AsQueryable();
        
        if (cursor.HasValue)
            query = query.Where(t => t.Id > cursor.Value);
        
        return await query
            .OrderBy(t => t.Id)
            .Take(limit + 1)
            .ToListAsync();
    }

    public async Task<Traslado> GetByIdAsync(int id)
        => await _context.Traslados.FirstOrDefaultAsync(t => t.Id == id);

    public async Task<Traslado?> GetByIdConRelacionesAsync(int id)
        => await _context.Traslados
            .Include(t => t.Hechiceros)
            .Include(t => t.Supervisores)
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task<Traslado> AddAsync(Traslado traslado)
    {
        traslado.Id = 0;
        await _context.Traslados.AddAsync(traslado);
        await _context.SaveChangesAsync();
        return traslado;
    }

    public async Task UpdateAsync(Traslado traslado)
    {
        _context.Traslados.Update(traslado);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Traslado traslado)
    {
        _context.Traslados.Remove(traslado);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> AgregarHechiceroAsync(Traslado traslado, Hechicero hechicero)
    {
        if (traslado.Hechiceros.Any(h => h.Id == hechicero.Id))
            return false;
            
        traslado.Hechiceros.Add(hechicero);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> QuitarHechiceroAsync(Traslado traslado, int hechiceroId)
    {
        var hechicero = traslado.Hechiceros.FirstOrDefault(h => h.Id == hechiceroId);
        if (hechicero == null) return false;
        
        traslado.Hechiceros.Remove(hechicero);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AgregarPersonalApoyoAsync(Traslado traslado, PersonalDeApoyo personal)
    {
        if (traslado.Supervisores.Any(p => p.Id == personal.Id))
            return false;
            
        traslado.Supervisores.Add(personal);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> QuitarPersonalApoyoAsync(Traslado traslado, int personalId)
    {
        var personal = traslado.Supervisores.FirstOrDefault(p => p.Id == personalId);
        if (personal == null) return false;
        
        traslado.Supervisores.Remove(personal);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Hechicero>> GetHechicerosEnTrasladoAsync(int trasladoId)
    {
        var traslado = await _context.Traslados
            .Include(t => t.Hechiceros)
            .FirstOrDefaultAsync(t => t.Id == trasladoId);
            
        return traslado?.Hechiceros ?? Enumerable.Empty<Hechicero>();
    }

    public async Task<IEnumerable<PersonalDeApoyo>> GetPersonalApoyoEnTrasladoAsync(int trasladoId)
    {
        var traslado = await _context.Traslados
            .Include(t => t.Supervisores)
            .FirstOrDefaultAsync(t => t.Id == trasladoId);
            
        return traslado?.Supervisores ?? Enumerable.Empty<PersonalDeApoyo>();
    }
}