using System.Threading.Tasks;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Models;

namespace GestionDeMisiones.Data.Seed
{
    public static class AuthSeeder
    {
        public static async Task SeedAdminAsync(IUsuarioRepository repo)
        {
            if (!await repo.AnyAdminExistsAsync())
            {
                var admin = new Usuario
                {
                    Nombre = "Admin",
                    Email = "admin@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Rol = "admin",
                    Rango = null
                };
                await repo.AddAsync(admin);
            }
        }
    }
}
