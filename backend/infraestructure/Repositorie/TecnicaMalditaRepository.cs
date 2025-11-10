using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Data;

namespace GestionDeMisiones.Repository;

public class TecnicaMalditaRepository : ITecnicaMalditaRepository
{
    private readonly AppDbContext _context;
    
    public TecnicaMalditaRepository(AppDbContext context) 
        => _context = context;

    public async Task<IEnumerable<TecnicaMaldita>> GetAllAsync()
        => await _context.TecnicasMalditas.ToListAsync();

    public async Task<TecnicaMaldita?> GetByIdAsync(int id)
        => await _context.TecnicasMalditas
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task<TecnicaMaldita> AddAsync(TecnicaMaldita tecnica)
    {
        tecnica.Id = 0;
        await _context.TecnicasMalditas.AddAsync(tecnica);
        await _context.SaveChangesAsync();
        return tecnica;
    }

    public async Task UpdateAsync(TecnicaMaldita tecnica)
    {
        _context.TecnicasMalditas.Update(tecnica);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(TecnicaMaldita tecnica)
    {
        _context.TecnicasMalditas.Remove(tecnica);
        await _context.SaveChangesAsync();
    }
}