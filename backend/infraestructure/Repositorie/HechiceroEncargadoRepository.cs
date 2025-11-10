using GestionDeMisiones.Models;
using GestionDeMisiones.Data;
using GestionDeMisiones.IRepository;
using Microsoft.EntityFrameworkCore;


namespace GestionDeMisiones.Repository
{
    public class HechiceroEncargadoRepository : IHechiceroEncargadoRepository
    {
        private readonly AppDbContext _context;

        public HechiceroEncargadoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<HechiceroEncargado>> GetAllAsync()
        {
            return await _context.HechiceroEncargado
                .Include(h => h.Hechicero)
                .Include(h => h.Mision)
                .Include(h => h.Solicitud)
                .ToListAsync();
        }

        public async Task<HechiceroEncargado?> GetByIdAsync(int id)
        {
            return await _context.HechiceroEncargado
                .Include(h => h.Hechicero)
                .Include(h => h.Mision)
                .Include(h => h.Solicitud)
                .FirstOrDefaultAsync(h => h.Id == id);
        }

        public async Task AddAsync(HechiceroEncargado hechiceroEncargado)
        {
            await _context.HechiceroEncargado.AddAsync(hechiceroEncargado);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(HechiceroEncargado hechiceroEncargado)
        {
            _context.HechiceroEncargado.Update(hechiceroEncargado);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(HechiceroEncargado hechiceroEncargado)
        {
            _context.HechiceroEncargado.Remove(hechiceroEncargado);
            await _context.SaveChangesAsync();
        }
    }
}
