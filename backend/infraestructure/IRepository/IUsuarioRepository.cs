using GestionDeMisiones.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace GestionDeMisiones.IRepository
{
    public interface IUsuarioRepository
    {
        Task<Usuario?> GetByEmailAsync(string email);
        Task<Usuario> AddAsync(Usuario usuario);
        Task<bool> AnyAdminExistsAsync();
        Task<List<Usuario>> GetAllAsync();
        Task<Usuario?> GetByIdAsync(int id);
        Task<Usuario?> UpdateAsync(Usuario usuario);
        Task<bool> DeleteAsync(int id);
        Task<bool> SetRoleAsync(int id, string newRole);
    }
}
