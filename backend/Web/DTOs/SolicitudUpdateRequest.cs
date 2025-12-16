using System.ComponentModel.DataAnnotations;
using GestionDeMisiones.Models;

namespace GestionDeMisiones.DTOs;

/// <summary>
/// DTO para actualizar una Solicitud con lógica de cascada automática.
/// Se usa cuando se cambia el estado de la Solicitud (ej: pendiente → atendiendose).
/// </summary>
public class SolicitudUpdateRequest
{
    /// <summary>
    /// Nuevo estado de la solicitud.
    /// </summary>
    [Required]
    public EEstadoSolicitud Estado { get; set; }

    /// <summary>
    /// ID del Hechicero Encargado. 
    /// - Requerido si se pasa a estado "atendiendose" (crear nueva misión).
    /// - Opcional si está en estado "atendiendose" (cambiar HechiceroEncargado existente).
    /// </summary>
    public int? HechiceroEncargadoId { get; set; }

    /// <summary>
    /// Nivel de urgencia de la misión. 
    /// - Requerido si se pasa a estado "atendiendose" (crear nueva misión).
    /// - Opcional si está en estado "atendiendose" (actualizar urgencia existente).
    /// </summary>
    public Mision.ENivelUrgencia? NivelUrgencia { get; set; }
}
