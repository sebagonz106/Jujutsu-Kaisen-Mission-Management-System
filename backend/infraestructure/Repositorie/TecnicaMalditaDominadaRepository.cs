using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Data;

namespace GestionDeMisiones.Repository;

public class TecnicaMalditaDominadaRepository : ITecnicaMalditaDominadaRepository
{
    private readonly AppDbContext _context;
    
    public TecnicaMalditaDominadaRepository(AppDbContext context) 
        => _context = context;

    public async Task<IEnumerable<TecnicaMalditaDominada>> GetAllAsync()
        => await _context.TecnicasMalditasDominadas
            .Include(tmd => tmd.Hechicero)
            .Include(tmd => tmd.TecnicaMaldita)
            .ToListAsync();

    public async Task<TecnicaMalditaDominada?> GetByIdAsync(int id)
        => await _context.TecnicasMalditasDominadas
            .Include(tmd => tmd.Hechicero)
            .Include(tmd => tmd.TecnicaMaldita)
            .FirstOrDefaultAsync(tmd => tmd.Id == id);

    public async Task<TecnicaMalditaDominada> AddAsync(TecnicaMalditaDominada tecnicaDominada)
    {
        tecnicaDominada.Id = 0;
        await _context.TecnicasMalditasDominadas.AddAsync(tecnicaDominada);
        await _context.SaveChangesAsync();
        return tecnicaDominada;
    }

    public async Task UpdateAsync(TecnicaMalditaDominada tecnicaDominada)
    {
        _context.TecnicasMalditasDominadas.Update(tecnicaDominada);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(TecnicaMalditaDominada tecnicaDominada)
    {
        _context.TecnicasMalditasDominadas.Remove(tecnicaDominada);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(int hechiceroId, int tecnicaMalditaId, int? excludeId = null)
    {
        var query = _context.TecnicasMalditasDominadas
            .Where(tmd => tmd.HechiceroId == hechiceroId && 
                         tmd.TecnicaMalditaId == tecnicaMalditaId);

        if (excludeId.HasValue)
            query = query.Where(tmd => tmd.Id != excludeId.Value);

        return await query.AnyAsync();
    }
}