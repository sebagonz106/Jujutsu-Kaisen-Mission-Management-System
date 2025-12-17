using GestionDeMisiones.Models;


namespace GestionDeMisiones.IRepository
{
    public interface IHechiceroEnMisionRepository
    {
        Task<IEnumerable<HechiceroEnMision>> GetAllAsync();
        Task<HechiceroEnMision?> GetByIdAsync(int id);
        Task<HechiceroEnMision> AddAsync(HechiceroEnMision hechiceroEncargado);
        Task UpdateAsync(HechiceroEnMision hechiceroEncargado);
        Task DeleteAsync(HechiceroEnMision hechiceroEncargado);
        
        /// <summary>
        /// Obtiene todos los HechiceroEnMision asociados a una Misión específica.
        /// </summary>
        Task<List<HechiceroEnMision>> GetByMisionIdAsync(int misionId);
    }
}
