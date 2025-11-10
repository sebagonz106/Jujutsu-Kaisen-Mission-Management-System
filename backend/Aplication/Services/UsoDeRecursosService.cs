using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.IService;

namespace GestionDeMisiones.Service
{
    public class UsoDeRecursoService : IUsoDeRecursoService
    {
        private readonly IUsoDeRecursoRepository _repository;

        public UsoDeRecursoService(IUsoDeRecursoRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<UsoDeRecurso>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<UsoDeRecurso?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<UsoDeRecurso> AddAsync(UsoDeRecurso usoDeRecurso)
        {
            bool conflicto = await _repository.ExistsConflictAsync(usoDeRecurso);
            if (conflicto)
                throw new InvalidOperationException("El recurso ya está asignado en ese tiempo.");

            await _repository.AddAsync(usoDeRecurso);
            await _repository.SaveChangesAsync();
            return usoDeRecurso;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var uso = await _repository.GetByIdAsync(id);
            if (uso == null)
                return false;

            _repository.Delete(uso);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<UsoDeRecurso?> UpdateAsync(int id, UsoDeRecurso usoDeRecurso)
        {
            var existente = await _repository.GetByIdAsync(id);
            if (existente == null)
                return null;

            bool conflicto = await _repository.ExistsConflictAsync(usoDeRecurso, id);
            if (conflicto)
                throw new InvalidOperationException("El recurso ya está asignado en ese tiempo.");

            existente.MisionId = usoDeRecurso.MisionId;
            existente.RecursoId = usoDeRecurso.RecursoId;
            existente.FechaInicio = usoDeRecurso.FechaInicio;
            existente.FechaFin = usoDeRecurso.FechaFin;
            existente.Observaciones = usoDeRecurso.Observaciones;

            _repository.Update(existente);
            await _repository.SaveChangesAsync();
            return existente;
        }
    }
}
