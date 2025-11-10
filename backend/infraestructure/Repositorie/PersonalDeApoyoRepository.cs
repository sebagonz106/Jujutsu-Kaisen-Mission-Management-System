using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Data;

namespace GestionDeMisiones.Repository;

public class PersonalDeApoyoRepository : IPersonalDeApoyoRepository
{
    private readonly AppDbContext _context;
    
    public PersonalDeApoyoRepository(AppDbContext context) 
        => _context = context;

    public async Task<IEnumerable<PersonalDeApoyo>> GetAllAsync()
        => await _context.PersonalDeApoyo.ToListAsync();

    public async Task<PersonalDeApoyo?> GetByIdAsync(int id)
        => await _context.PersonalDeApoyo
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<PersonalDeApoyo> AddAsync(PersonalDeApoyo personal)
    {
        personal.Id = 0;
        await _context.PersonalDeApoyo.AddAsync(personal);
        await _context.SaveChangesAsync();
        return personal;
    }

    public async Task UpdateAsync(PersonalDeApoyo personal)
    {
        _context.PersonalDeApoyo.Update(personal);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(PersonalDeApoyo personal)
    {
        _context.PersonalDeApoyo.Remove(personal);
        await _context.SaveChangesAsync();
    }
}