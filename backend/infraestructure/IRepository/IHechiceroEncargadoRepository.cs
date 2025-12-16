using GestionDeMisiones.Models;


namespace GestionDeMisiones.IRepository
{
    public interface IHechiceroEncargadoRepository
    {
        Task<IEnumerable<HechiceroEncargado>> GetAllAsync();
        Task<IEnumerable<HechiceroEncargado>> GetPagedAsync(int? cursor, int limit);
        Task<HechiceroEncargado?> GetByIdAsync(int id);
        Task<HechiceroEncargado> AddAsync(HechiceroEncargado hechiceroEncargado);
        Task UpdateAsync(HechiceroEncargado hechiceroEncargado);
        Task DeleteAsync(HechiceroEncargado hechiceroEncargado);
        
        /// <summary>
        /// Obtiene el HechiceroEncargado asociado a una Solicitud específica.
        /// </summary>
        Task<HechiceroEncargado?> GetBySolicitudIdAsync(int solicitudId);
        
        /// <summary>
        /// Obtiene el HechiceroEncargado asociado a una Misión específica.
        /// </summary>
        Task<HechiceroEncargado?> GetByMisionIdAsync(int misionId);
    }
}
