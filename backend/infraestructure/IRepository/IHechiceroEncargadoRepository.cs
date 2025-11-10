using GestionDeMisiones.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

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
