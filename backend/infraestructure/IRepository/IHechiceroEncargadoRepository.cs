using GestionDeMisiones.Models;


namespace GestionDeMisiones.IRepository
{
    public interface IHechiceroEncargadoRepository
    {
        Task<IEnumerable<HechiceroEncargado>> GetAllAsync();
        Task<IEnumerable<HechiceroEncargado>> GetPagedAsync(int? cursor, int limit);
        Task<HechiceroEncargado?> GetByIdAsync(int id);
        Task AddAsync(HechiceroEncargado hechiceroEncargado);
        Task UpdateAsync(HechiceroEncargado hechiceroEncargado);
        Task DeleteAsync(HechiceroEncargado hechiceroEncargado);
    }
}
