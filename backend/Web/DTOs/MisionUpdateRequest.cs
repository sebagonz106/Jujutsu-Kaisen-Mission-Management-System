using GestionDeMisiones.Models;
using System.ComponentModel.DataAnnotations;

namespace GestionDeMisiones.Web.DTOs
{
    /// <summary>
    /// DTO para actualizar una Misión con lógica de cascada automática.
    /// Se usa cuando se cambia el estado de la Misión (ej: pendiente → en_progreso).
    /// </summary>
    public class MisionUpdateRequest
    {
        /// <summary>
        /// Nuevo estado de la misión.
        /// </summary>
        [Required]
        public Mision.EEstadoMision Estado { get; set; }

        /// <summary>
        /// ID de la Ubicación. Requerido solo si se pasa a estado "en_progreso".
        /// </summary>
        public int? UbicacionId { get; set; }

        /// <summary>
        /// Array de IDs de Hechiceros a asignar a la Misión.
        /// Requerido solo si se pasa a estado "en_progreso".
        /// Se crearán automáticamente registros HechiceroEnMision para cada uno.
        /// </summary>
        public int[]? HechicerosIds { get; set; }
    }
}
