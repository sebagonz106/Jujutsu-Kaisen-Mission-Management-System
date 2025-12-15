using GestionDeMisiones.Models;


namespace GestionDeMisiones.IService
{
    public interface IUsoDeRecursoService
    {
        Task<IEnumerable<UsoDeRecurso>> GetAllAsync();
        Task<(IEnumerable<UsoDeRecurso> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit);
        Task<UsoDeRecurso?> GetByIdAsync(int id);
        Task<UsoDeRecurso> AddAsync(UsoDeRecurso usoDeRecurso);
        Task<bool> DeleteAsync(int id);
        Task<UsoDeRecurso?> UpdateAsync(int id, UsoDeRecurso usoDeRecurso);
    }
}
