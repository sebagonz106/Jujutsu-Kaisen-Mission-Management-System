using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Data;

namespace GestionDeMisiones.Repository;

public class RecursoRepository : IRecursoRepository
{
    private readonly AppDbContext _context;
    
    public RecursoRepository(AppDbContext context) 
        => _context = context;

    public async Task<IEnumerable<Recurso>> GetAllAsync()
        => await _context.Recursos.ToListAsync();

    public async Task<Recurso?> GetByIdAsync(int id)
        => await _context.Recursos
            .FirstOrDefaultAsync(r => r.Id == id);

    public async Task<Recurso> AddAsync(Recurso recurso)
    {
        recurso.Id = 0;
        await _context.Recursos.AddAsync(recurso);
        await _context.SaveChangesAsync();
        return recurso;
    }

    public async Task UpdateAsync(Recurso recurso)
    {
        _context.Recursos.Update(recurso);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Recurso recurso)
    {
        _context.Recursos.Remove(recurso);
        await _context.SaveChangesAsync();
    }
}