using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Data;

namespace GestionDeMisiones.Repository;

public class SolicitudRepository : ISolicitudRepository
{
    private readonly AppDbContext _context;
    
    public SolicitudRepository(AppDbContext context) 
        => _context = context;

    public async Task<IEnumerable<Solicitud>> GetAllAsync()
        => await _context.Solicitud
            .Include(s => s.Maldicion)
                .ThenInclude(m => m.UbicacionDeAparicion)
            .ToListAsync();

    public async Task<Solicitud?> GetByIdAsync(int id)
        => await _context.Solicitud
            .Include(s => s.Maldicion)
                .ThenInclude(m => m.UbicacionDeAparicion)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<Solicitud> AddAsync(Solicitud solicitud)
    {
        solicitud.Id = 0;
        await _context.Solicitud.AddAsync(solicitud);
        await _context.SaveChangesAsync();
        return solicitud;
    }

    public async Task UpdateAsync(Solicitud solicitud)
    {
        _context.Solicitud.Update(solicitud);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Solicitud solicitud)
    {
        _context.Solicitud.Remove(solicitud);
        await _context.SaveChangesAsync();
    }
}