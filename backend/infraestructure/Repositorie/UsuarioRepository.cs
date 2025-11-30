using GestionDeMisiones.Data;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

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
            return await _ctx.Usuarios.AnyAsync(u => u.Rol.ToLower() == "admin");
        }

        // New methods
        public async Task<List<Usuario>> GetAllAsync()
        {
            return await _ctx.Usuarios.AsNoTracking().ToListAsync();
        }

        public async Task<Usuario?> GetByIdAsync(int id)
        {
            return await _ctx.Usuarios.FindAsync(id);
        }

        public async Task<Usuario?> UpdateAsync(Usuario usuario)
        {
            var existing = await _ctx.Usuarios.FindAsync(usuario.Id);
            if (existing == null) return null;
            existing.Nombre = usuario.Nombre;
            existing.Email = usuario.Email;
            // Only update password if provided (non-empty)
            if (!string.IsNullOrWhiteSpace(usuario.PasswordHash))
            {
                existing.PasswordHash = usuario.PasswordHash;
            }
            existing.Rol = usuario.Rol;
            existing.Rango = usuario.Rango;
            await _ctx.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _ctx.Usuarios.FindAsync(id);
            if (existing == null) return false;
            _ctx.Usuarios.Remove(existing);
            await _ctx.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetRoleAsync(int id, string newRole)
        {
            var user = await _ctx.Usuarios.FindAsync(id);
            if (user == null) return false;
            var normalized = NormalizeRoleForPersistence(newRole);
            user.Rol = normalized ?? user.Rol;
            await _ctx.SaveChangesAsync();
            return true;
        }

        private static string? NormalizeRoleForPersistence(string inputRole)
        {
            if (string.IsNullOrWhiteSpace(inputRole)) return null;
            var r = inputRole.Trim().ToLowerInvariant();
            return r switch
            {
                "observador" => "observador",
                "observer" => "observador",
                "hechicero" => "hechicero",
                "sorcerer" => "hechicero",
                "support" => "support",
                "admin" => "admin",
                _ => null
            };
        }
    }
}
