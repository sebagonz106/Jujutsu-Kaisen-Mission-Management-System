using GestionDeMisiones.Data;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using Microsoft.EntityFrameworkCore;


namespace GestionDeMisiones.Repository
{
    public class UsoDeRecursoRepository : IUsoDeRecursoRepository
    {
        private readonly AppDbContext _context;

        public UsoDeRecursoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UsoDeRecurso>> GetAllAsync()
        {
            return await _context.UsosDeRecurso
                .Include(u => u.Mision)
                .Include(u => u.Recurso)
                .ToListAsync();
        }

        public async Task<UsoDeRecurso?> GetByIdAsync(int id)
        {
            return await _context.UsosDeRecurso
                .Include(u => u.Mision)
                .Include(u => u.Recurso)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task AddAsync(UsoDeRecurso usoDeRecurso)
        {
            await _context.UsosDeRecurso.AddAsync(usoDeRecurso);
        }

        public void Update(UsoDeRecurso usoDeRecurso)
        {
            _context.UsosDeRecurso.Update(usoDeRecurso);
        }

        public void Delete(UsoDeRecurso usoDeRecurso)
        {
            _context.UsosDeRecurso.Remove(usoDeRecurso);
        }

        public async Task<bool> ExistsConflictAsync(UsoDeRecurso usoDeRecurso, int? excludeId = null)
        {
            return await _context.UsosDeRecurso
                .AnyAsync(u =>
                    (excludeId == null || u.Id != excludeId) &&
                    u.RecursoId == usoDeRecurso.RecursoId &&
                    (usoDeRecurso.FechaFin == null
                        ? u.FechaFin == null || usoDeRecurso.FechaInicio < u.FechaFin
                        : usoDeRecurso.FechaInicio < u.FechaFin && usoDeRecurso.FechaFin > u.FechaInicio)
                );
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
