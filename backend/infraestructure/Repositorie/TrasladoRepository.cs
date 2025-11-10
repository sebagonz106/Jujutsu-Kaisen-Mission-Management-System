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

    public async Task<Traslado> GetByIdAsync(int id)
        => await _context.Traslados.FirstOrDefaultAsync(t => t.Id == id);

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
}
