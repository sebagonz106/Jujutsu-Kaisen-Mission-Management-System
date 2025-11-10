using System.ComponentModel.DataAnnotations;

namespace GestionDeMisiones.Models
{
    public class Usuario
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Rol { get; set; } = "observer";

        [MaxLength(50)]
        public string? Rango { get; set; }

        public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    }
}
