// Repositories/HechiceroRepository.cs
using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Data;
namespace GestionDeMisiones.Repository;
public class HechiceroRepository : IHechiceroRepository
{
    private readonly AppDbContext _context;
    public HechiceroRepository(AppDbContext context) => _context = context;

    public async Task<IEnumerable<Hechicero>> GetAllAsync()
        => await _context.Hechiceros.Include(h => h.TecnicaPrincipal).ToListAsync();

    public async Task<List<Hechicero>> GetPagedAsync(int? cursor, int limit)
    {
        var query = _context.Hechiceros
            .Include(h => h.TecnicaPrincipal)
            .AsQueryable();

        if (cursor.HasValue)
            query = query.Where(h => h.Id > cursor.Value);

        return await query
            .OrderBy(h => h.Id)
            .Take(limit + 1) // fetch one extra to compute hasMore
            .ToListAsync();
    }

    public async Task<Hechicero?> GetByIdAsync(int id)
        => await _context.Hechiceros
            .Include(h => h.TecnicaPrincipal)
            .FirstOrDefaultAsync(h => h.Id == id);

    public async Task<Hechicero> AddAsync(Hechicero hechicero)
    {
        hechicero.Id = 0;
        await _context.Hechiceros.AddAsync(hechicero);
        await _context.SaveChangesAsync();
        return hechicero;
    }

    public async Task UpdateAsync(Hechicero hechicero)
    {
        _context.Hechiceros.Update(hechicero);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Hechicero hechicero)
    {
        _context.Hechiceros.Remove(hechicero);
        await _context.SaveChangesAsync();
    }
}
