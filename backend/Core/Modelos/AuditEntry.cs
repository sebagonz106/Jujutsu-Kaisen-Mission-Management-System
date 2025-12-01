using System.ComponentModel.DataAnnotations;

namespace GestionDeMisiones.Models;

/// <summary>
/// Representa una entrada en el registro de auditoría del sistema.
/// Captura quién hizo qué, a qué entidad y cuándo.
/// </summary>
public class AuditEntry
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Fecha y hora en que ocurrió la acción (UTC).
    /// </summary>
    [Required]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Tipo de entidad afectada (hechicero, maldicion, mision, ubicacion, tecnica).
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Entity { get; set; } = string.Empty;

    /// <summary>
    /// Acción realizada (create, update, delete).
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// ID de la entidad afectada.
    /// </summary>
    [Required]
    public int EntityId { get; set; }

    /// <summary>
    /// Rol del actor que realizó la acción.
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string ActorRole { get; set; } = string.Empty;

    /// <summary>
    /// Rango del actor (opcional, aplica para hechiceros).
    /// </summary>
    [MaxLength(50)]
    public string? ActorRank { get; set; }

    /// <summary>
    /// Nombre del actor (opcional).
    /// </summary>
    [MaxLength(120)]
    public string? ActorName { get; set; }

    /// <summary>
    /// Resumen legible de la acción realizada.
    /// </summary>
    [MaxLength(500)]
    public string? Summary { get; set; }
}
