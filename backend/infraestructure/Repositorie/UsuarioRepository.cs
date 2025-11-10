using GestionDeMisiones.Data;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionDeMisiones.Repository
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly AppDbContext _ctx;
        public UsuarioRepository(AppDbContext ctx)
        {
            _ctx = ctx;
        }

        public async Task<Usuario?> GetByEmailAsync(string email)
        {
            var lowered = email.ToLowerInvariant();
            return await _ctx.Usuarios.FirstOrDefaultAsync(u => u.Email.ToLower() == lowered);
        }

        public async Task<Usuario> AddAsync(Usuario usuario)
        {
            _ctx.Usuarios.Add(usuario);
            await _ctx.SaveChangesAsync();
            return usuario;
        }

        public async Task<bool> AnyAdminExistsAsync()
        {
            return await _ctx.Usuarios.AnyAsync(u => u.Rol == "admin");
        }
    }
}
