using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Data;

namespace GestionDeMisiones.Repository;

public class MisionRepository : IMisionRepository
{
    private readonly AppDbContext _context;
    
    public MisionRepository(AppDbContext context) 
        => _context = context;

    public async Task<IEnumerable<Mision>> GetAllAsync()
        => await _context.Misiones
            .Include(m => m.Ubicacion)
            .ToListAsync();

    public async Task<Mision?> GetByIdAsync(int id)
        => await _context.Misiones
            .Include(m => m.Ubicacion)
            .FirstOrDefaultAsync(m => m.Id == id);

    public async Task<Mision> AddAsync(Mision mision)
    {
        mision.Id = 0;
        await _context.Misiones.AddAsync(mision);
        await _context.SaveChangesAsync();
        return mision;
    }

    public async Task UpdateAsync(Mision mision)
    {
        _context.Misiones.Update(mision);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Mision mision)
    {
        _context.Misiones.Remove(mision);
        await _context.SaveChangesAsync();
    }
}