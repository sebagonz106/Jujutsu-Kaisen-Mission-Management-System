using GestionDeMisiones.Models;


namespace GestionDeMisiones.IRepository
{
    public interface IUsoDeRecursoRepository
    {
        Task<IEnumerable<UsoDeRecurso>> GetAllAsync();
        Task<UsoDeRecurso?> GetByIdAsync(int id);
        Task AddAsync(UsoDeRecurso usoDeRecurso);
        void Update(UsoDeRecurso usoDeRecurso);
        void Delete(UsoDeRecurso usoDeRecurso);
        Task<bool> ExistsConflictAsync(UsoDeRecurso usoDeRecurso, int? excludeId = null);
        Task SaveChangesAsync();
    }
}
