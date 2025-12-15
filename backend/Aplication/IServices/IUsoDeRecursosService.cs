using GestionDeMisiones.Models;


namespace GestionDeMisiones.IService
{
    public interface IUsoDeRecursoService
    {
        Task<IEnumerable<UsoDeRecurso>> GetAllAsync();
        Task<UsoDeRecurso?> GetByIdAsync(int id);
        Task<UsoDeRecurso> AddAsync(UsoDeRecurso usoDeRecurso);
        Task<bool> DeleteAsync(int id);
        Task<UsoDeRecurso?> UpdateAsync(int id, UsoDeRecurso usoDeRecurso);
    }
}
