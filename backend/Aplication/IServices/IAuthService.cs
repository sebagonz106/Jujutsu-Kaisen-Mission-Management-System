using System.Security.Claims;
using System.Threading.Tasks;

namespace GestionDeMisiones.IService
{
    public class AuthUser
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "observer";
        public string? Rank { get; set; }
    }

    public interface IAuthService
    {
        Task<(string accessToken, AuthUser user)> LoginAsync(string email, string password);
        Task<(string accessToken, AuthUser user)> RegisterAsync(string name, string email, string password);
        Task<AuthUser> CreateUserAsync(string name, string email, string password, string role, string? rank);
        AuthUser? GetUserFromClaims(ClaimsPrincipal user);
    }
}
