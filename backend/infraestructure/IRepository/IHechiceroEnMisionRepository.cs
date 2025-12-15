using GestionDeMisiones.Models;


namespace GestionDeMisiones.IRepository
{
    public interface IHechiceroEnMisionRepository
    {
        Task<IEnumerable<HechiceroEnMision>> GetAllAsync();
        Task<HechiceroEnMision?> GetByIdAsync(int id);
        Task AddAsync(HechiceroEnMision hechiceroEncargado);
        Task UpdateAsync(HechiceroEnMision hechiceroEncargado);
        Task DeleteAsync(HechiceroEnMision hechiceroEncargado);
    }
}
