using GestionDeMisiones.Models;


namespace GestionDeMisiones.IService
{
    public interface IHechiceroEnMisionService
    {
        Task<IEnumerable<HechiceroEnMision>> GetAllAsync();
        Task<HechiceroEnMision?> GetByIdAsync(int id);
        Task<HechiceroEnMision> CreateAsync(HechiceroEnMision hechiceroEncargado);
        Task<bool> UpdateAsync(int id, HechiceroEnMision hechiceroEncargado);
        Task<bool> DeleteAsync(int id);
    }
}
