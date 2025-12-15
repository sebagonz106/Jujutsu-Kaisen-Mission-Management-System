using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Data;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Repository;

public class SubordinacionRepository : ISubordinacionRepository
{
    private readonly AppDbContext _context;

    public SubordinacionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Subordinacion?> GetByIdAsync(int id)
    {
        return await _context.Subordinaciones
            .Include(s => s.Maestro)
            .Include(s => s.Discipulo)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<Subordinacion>> GetAllAsync()
    {
        return await _context.Subordinaciones
            .Include(s => s.Maestro)
            .Include(s => s.Discipulo)
            .OrderByDescending(s => s.FechaInicio)
            .ToListAsync();
    }

    public async Task<Subordinacion> AddAsync(Subordinacion subordinacion)
    {
        await _context.Subordinaciones.AddAsync(subordinacion);
        await _context.SaveChangesAsync();
        return subordinacion;
    }

    public async Task UpdateAsync(Subordinacion subordinacion)
    {
        _context.Subordinaciones.Update(subordinacion);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Subordinacion subordinacion)
    {
        _context.Subordinaciones.Remove(subordinacion);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExisteRelacionActivaAsync(int maestroId, int discipuloId)
    {
        return await _context.Subordinaciones
            .AnyAsync(s => s.MaestroId == maestroId 
                        && s.DiscipuloId == discipuloId
                        && s.Activa);
    }
}