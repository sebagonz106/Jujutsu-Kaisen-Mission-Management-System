using GestionDeMisiones.Models;


namespace GestionDeMisiones.IService
{
    public interface IHechiceroEncargadoService
    {
        Task<IEnumerable<HechiceroEncargado>> GetAllAsync();
        Task<(IEnumerable<HechiceroEncargado> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit);
        Task<HechiceroEncargado?> GetByIdAsync(int id);
        Task<HechiceroEncargado> CreateAsync(HechiceroEncargado hechiceroEncargado);
        Task<bool> UpdateAsync(int id, HechiceroEncargado hechiceroEncargado);
        Task<bool> DeleteAsync(int id);
    }
}
