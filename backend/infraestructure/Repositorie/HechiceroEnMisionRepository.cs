using GestionDeMisiones.Models;
using GestionDeMisiones.Data;
using GestionDeMisiones.IRepository;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;


namespace GestionDeMisiones.Repository;

public class HechiceroEnMisionRepository:IHechiceroEnMisionRepository
{
    private readonly AppDbContext _context;

    public HechiceroEnMisionRepository (AppDbContext context)
    {
        _context=context;
    }

    public async Task<IEnumerable<HechiceroEnMision>>GetAllAsync()
    {
        return await _context.HechiceroEnMision.Include(h=>h.Hechicero).Include(m=>m.Mision).ToListAsync();
    }
    public async Task<HechiceroEnMision?>GetByIdAsync(int id)
    {
        var hechicero= await _context.HechiceroEnMision.Include(h=>h.Hechicero).Include(h=>h.Mision).FirstOrDefaultAsync(x=>x.Id==id);
        return hechicero;
    }

    public async Task AddAsync(HechiceroEnMision hechicero)
    {
        await _context.HechiceroEnMision.AddAsync(hechicero);
        await _context.SaveChangesAsync();
    }

    public async  Task UpdateAsync(HechiceroEnMision hechicero)
    {
        _context.HechiceroEnMision.Update(hechicero);
        await _context.SaveChangesAsync();
    }
     public async Task DeleteAsync(HechiceroEnMision hechicero)
    {
        _context.HechiceroEnMision.Remove(hechicero);
        await _context.SaveChangesAsync();
    }
}
