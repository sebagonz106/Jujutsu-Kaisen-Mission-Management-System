using GestionDeMisiones.Models;


namespace GestionDeMisiones.IRepository
{
    public interface IHechiceroEncargadoRepository
    {
        Task<IEnumerable<HechiceroEncargado>> GetAllAsync();
        Task<HechiceroEncargado?> GetByIdAsync(int id);
        Task AddAsync(HechiceroEncargado hechiceroEncargado);
        Task UpdateAsync(HechiceroEncargado hechiceroEncargado);
        Task DeleteAsync(HechiceroEncargado hechiceroEncargado);
    }
}
