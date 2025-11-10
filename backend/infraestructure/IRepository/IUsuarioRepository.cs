using GestionDeMisiones.Models;
using System.Threading.Tasks;

namespace GestionDeMisiones.IRepository
{
    public interface IUsuarioRepository
    {
        Task<Usuario?> GetByEmailAsync(string email);
        Task<Usuario> AddAsync(Usuario usuario);
        Task<bool> AnyAdminExistsAsync();
    }
}
