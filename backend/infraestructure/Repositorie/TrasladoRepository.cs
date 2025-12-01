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
        => await _context.Traslados
            .Include(t => t.Origen)
            .Include(t => t.Destino)
            .Include(t => t.Mision)
            .Include(t => t.Hechiceros)
            .ToListAsync();

    public async Task<List<Traslado>> GetPagedAsync(int? cursor, int limit)
    {
        var query = _context.Traslados
            .Include(t => t.Origen)
            .Include(t => t.Destino)
            .Include(t => t.Mision)
            .Include(t => t.Hechiceros)
            .AsQueryable();

        if (cursor.HasValue)
            query = query.Where(t => t.Id > cursor.Value);

        return await query.OrderBy(t => t.Id).Take(limit + 1).ToListAsync();
    }

    public async Task<Traslado> GetByIdAsync(int id)
        => await _context.Traslados
            .Include(t => t.Origen)
            .Include(t => t.Destino)
            .Include(t => t.Mision)
            .Include(t => t.Hechiceros)
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task<Traslado> AddAsync(Traslado traslado)
    {
        traslado.Id = 0;
        await _context.Traslados.AddAsync(traslado);
        await _context.SaveChangesAsync();
        return traslado;
    }

    public async Task<Traslado> AddWithHechicerosAsync(Traslado traslado, List<int>? hechicerosIds)
    {
        traslado.Id = 0;
        
        if (hechicerosIds != null && hechicerosIds.Count > 0)
        {
            var hechiceros = await _context.Hechiceros
                .Where(h => hechicerosIds.Contains(h.Id))
                .ToListAsync();
            traslado.Hechiceros = hechiceros;
        }
        
        await _context.Traslados.AddAsync(traslado);
        await _context.SaveChangesAsync();
        return traslado;
    }

    public async Task UpdateWithHechicerosAsync(Traslado traslado, List<int>? hechicerosIds)
    {
        // Cargar los hechiceros actuales
        await _context.Entry(traslado).Collection(t => t.Hechiceros).LoadAsync();
        
        // Limpiar y reasignar
        traslado.Hechiceros.Clear();
        
        if (hechicerosIds != null && hechicerosIds.Count > 0)
        {
            var hechiceros = await _context.Hechiceros
                .Where(h => hechicerosIds.Contains(h.Id))
                .ToListAsync();
            foreach (var h in hechiceros)
                traslado.Hechiceros.Add(h);
        }
        
        _context.Traslados.Update(traslado);
        await _context.SaveChangesAsync();
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
}
