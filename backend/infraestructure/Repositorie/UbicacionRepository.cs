using GestionDeMisiones.Data;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using Microsoft.EntityFrameworkCore;

namespace GestionDeMisiones.Repository
{
    public class UbicacionRepository : IUbicacionRepository
    {
        private readonly AppDbContext _context;

        public UbicacionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Ubicacion>> GetAllAsync()
        {
            return await _context.Ubicaciones.ToListAsync();
        }

        public async Task<Ubicacion?> GetByIdAsync(int id)
        {
            return await _context.Ubicaciones.FindAsync(id);
        }

        public async Task<Ubicacion> AddAsync(Ubicacion ubicacion)
        {
            ubicacion.Id = 0;
            _context.Ubicaciones.Add(ubicacion);
            await _context.SaveChangesAsync();
            return ubicacion;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var ubicacion = await _context.Ubicaciones.FindAsync(id);
            if (ubicacion == null) return false;
            _context.Ubicaciones.Remove(ubicacion);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Ubicacion?> UpdateAsync(int id, Ubicacion ubicacion)
        {
            var existente = await _context.Ubicaciones.FindAsync(id);
            if (existente == null) return null;

            existente.Nombre = ubicacion.Nombre;
            await _context.SaveChangesAsync();
            return existente;
        }
    }
}
