using GestionDeMisiones.IService;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace GestionDeMisiones.Service
{
    /// <summary>
    /// Simple in-memory authentication service (NOT FOR PRODUCTION).
    /// Stores users in a concurrent dictionary and issues JWT tokens.
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _config;
        private readonly IUsuarioRepository _usersRepo;

        public AuthService(IConfiguration config, IUsuarioRepository usersRepo)
        {
            _config = config;
            _usersRepo = usersRepo;
        }

        public async Task<(string accessToken, AuthUser user)> LoginAsync(string email, string password)
        {
            var userRec = await _usersRepo.GetByEmailAsync(email);
            if (userRec == null)
                throw new ArgumentException("Credenciales inválidas");

            if (!BCrypt.Net.BCrypt.Verify(password, userRec.PasswordHash))
                throw new ArgumentException("Credenciales inválidas");

            var normalizedRole = NormalizeRoleForToken(userRec.Rol);
            var authUser = new AuthUser { Id = userRec.Id, Name = userRec.Nombre, Email = userRec.Email, Role = normalizedRole, Rank = userRec.Rango };
            var token = GenerateJwt(authUser);
            return (token, authUser);
        }

        public async Task<(string accessToken, AuthUser user)> RegisterAsync(string name, string email, string password)
        {
            var existing = await _usersRepo.GetByEmailAsync(email);
            if (existing != null)
                throw new ArgumentException("El email ya está registrado");

            var hash = BCrypt.Net.BCrypt.HashPassword(password);
            // Persistimos en español segun requerimiento: observador|support|hechicero
            var user = new Usuario { Nombre = name, Email = email, PasswordHash = hash, Rol = "observador" };
            user = await _usersRepo.AddAsync(user);
            var normalizedRole = NormalizeRoleForToken(user.Rol);
            var authUser = new AuthUser { Id = user.Id, Name = user.Nombre, Email = user.Email, Role = normalizedRole, Rank = user.Rango };
            var token = GenerateJwt(authUser);
            return (token, authUser);
        }

        public async Task<AuthUser> CreateUserAsync(string name, string email, string password, string role, string? rank)
        {
            // Validar email único
            var existing = await _usersRepo.GetByEmailAsync(email);
            if (existing != null)
                throw new ArgumentException("El email ya está registrado");

            // Normalizar rol de entrada (acepta español o inglés)
            var dbRole = NormalizeRoleForPersistence(role);
            if (dbRole == null)
                throw new ArgumentException("Rol no válido. Use observador/observer, hechicero/sorcerer, support, admin");

            var hash = BCrypt.Net.BCrypt.HashPassword(password);
            var user = new Usuario { Nombre = name, Email = email, PasswordHash = hash, Rol = dbRole, Rango = rank };
            user = await _usersRepo.AddAsync(user);
            var normalizedRole = NormalizeRoleForToken(user.Rol);
            return new AuthUser { Id = user.Id, Name = user.Nombre, Email = user.Email, Role = normalizedRole, Rank = user.Rango };
        }

        public AuthUser? GetUserFromClaims(ClaimsPrincipal user)
        {
            if (user?.Identity?.IsAuthenticated != true) return null;
            var id = user.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;
            var name = user.FindFirstValue("name") ?? string.Empty;
            var email = user.FindFirstValue(JwtRegisteredClaimNames.Email) ?? string.Empty;
            var role = user.FindFirstValue(ClaimTypes.Role) ?? "user";
            return new AuthUser { Id = id, Name = name, Email = email, Role = role };
        }

        private string GenerateJwt(AuthUser user)
        {
            var jwtSection = _config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection.GetValue<string>("Key")!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var issuer = jwtSection.GetValue<string>("Issuer");
            var audience = jwtSection.GetValue<string>("Audience");
            var expiresMinutes = jwtSection.GetValue<int>("ExpiresMinutes");

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("name", user.Name),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string NormalizeRoleForToken(string dbRole)
        {
            if (string.IsNullOrWhiteSpace(dbRole)) return "observer";
            var r = dbRole.Trim().ToLowerInvariant();
            return r switch
            {
                // DB en español -> token en inglés esperado por FE
                "observador" => "observer",
                "hechicero" => "sorcerer",
                "support" => "support",
                // Admin: si FE aún no soporta 'admin', podría mapearse a support; aquí lo exponemos como 'admin'
                "admin" => "admin",
                // Ya en inglés o desconocido
                "observer" => "observer",
                "sorcerer" => "sorcerer",
                _ => "observer"
            };
        }

        private static string? NormalizeRoleForPersistence(string inputRole)
        {
            if (string.IsNullOrWhiteSpace(inputRole)) return null;
            var r = inputRole.Trim().ToLowerInvariant();
            return r switch
            {
                "observador" => "observador",
                "observer" => "observador", // persistimos en español
                "hechicero" => "hechicero",
                "sorcerer" => "hechicero",
                "support" => "support", // ya está aceptado así
                "admin" => "admin",
                _ => null
            };
        }
    }
}
