using GestionDeMisiones.Data;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using Microsoft.EntityFrameworkCore;


namespace GestionDeMisiones.Repository
{
    public class MaldicionRepository : IMaldicionRepository
    {
        private readonly AppDbContext _context;

        public MaldicionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Maldicion>> GetAllAsync()
        {
            return await _context.Maldiciones
                .Include(m => m.UbicacionDeAparicion)
                .ToListAsync();
        }

        public async Task<List<Maldicion>> GetPagedAsync(int? cursor, int limit)
        {
            var query = _context.Maldiciones
                .Include(m => m.UbicacionDeAparicion)
                .AsQueryable();

            if (cursor.HasValue)
                query = query.Where(m => m.Id > cursor.Value);

            return await query
                .OrderBy(m => m.Id)
                .Take(limit + 1)
                .ToListAsync();
        }

        public async Task<Maldicion?> GetByIdAsync(int id)
        {
            return await _context.Maldiciones
                .Include(m => m.UbicacionDeAparicion)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<Maldicion> AddAsync(Maldicion maldicion)
        {
            await _context.Maldiciones.AddAsync(maldicion);
            await _context.SaveChangesAsync();
            return maldicion;
        }

        public async Task<bool> UpdateAsync(int id, Maldicion updated)
        {
            var existing = await _context.Maldiciones.FindAsync(id);
            if (existing == null)
                return false;

            existing.Nombre = updated.Nombre;
            existing.EstadoActual = updated.EstadoActual;
            existing.FechaYHoraDeAparicion = updated.FechaYHoraDeAparicion;
            existing.Grado = updated.Grado;
            existing.NivelPeligro = updated.NivelPeligro;
            existing.Tipo = updated.Tipo;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                // Iniciar transacción explícita para garantizar atomicidad de la operación
                await using var tx = await _context.Database.BeginTransactionAsync();

                var maldicion = await _context.Maldiciones.FindAsync(id);
                if (maldicion == null)
                    return false;

                // Limpiar las entidades dependientes para evitar conflictos de FK:
                // 1) Obtener Solicitudes de esta Maldición
                // 2) Eliminar HechiceroEncargado relacionados
                // 3) Eliminar las Solicitudes
                var solicitudes = await _context.Solicitud.Where(s => s.MaldicionId == id).ToListAsync();
                if (solicitudes.Any())
                {
                    var solicitudIds = solicitudes.Select(s => s.Id).ToList();

                    var hechiceros = _context.HechiceroEncargado.Where(h => solicitudIds.Contains(h.SolicitudId));
                    _context.HechiceroEncargado.RemoveRange(hechiceros);

                    _context.Solicitud.RemoveRange(solicitudes);
                }

                _context.Maldiciones.Remove(maldicion);

                try
                {
                    await _context.SaveChangesAsync();
                    await tx.CommitAsync();
                    return true;
                }
                catch (DbUpdateConcurrencyException)
                {
                    // Conflicto de concurrencia: no se eliminó
                    await tx.RollbackAsync();
                    return false;
                }
                catch (DbUpdateException ex)
                {
                    // Fallos de integridad / FK: revertir y convertir a excepción comprensible
                    await tx.RollbackAsync();
                    throw new InvalidOperationException("No se pudo eliminar la maldición debido a restricciones de integridad referencial.", ex);
                }
                catch (Exception)
                {
                    await tx.RollbackAsync();
                    throw;
                }
            });
        }
    }
}
