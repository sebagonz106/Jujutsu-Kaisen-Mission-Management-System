using System.Collections;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GestionDeMisiones.Models;

public class Mision
{
    [Key]
    public int Id { get; set; }

    [DataType(DataType.DateTime)]
    public DateTime FechaYHoraDeInicio { get; set; } = DateTime.Now;

    [DataType(DataType.DateTime)]
    public DateTime? FechaYHoraDeFin { get; set; }

    /// <summary>
    /// Establece la fecha de fin validando que sea posterior a la de inicio.
    /// Usar este método en lugar de asignar directamente a FechaYHoraDeFin para validación.
    /// </summary>
    public void SetFechaFin(DateTime? fecha)
    {
        if (fecha != null && fecha.Value <= FechaYHoraDeInicio)
            throw new ArgumentException("La fecha de fin debe ser posterior a la de inicio");
        FechaYHoraDeFin = fecha;
    }

    [Required]
    public int UbicacionId { get; set; }
    public Ubicacion? Ubicacion { get; set; }

    [Range(0, 4, ErrorMessage = "Estado de mision no valido")]
    public EEstadoMision Estado { get; set; } = EEstadoMision.Pendiente;

    public string EventosOcurridos { get; set; } = "";

    public string DannosColaterales { get; set; } = "";

    [Required]
    [Range(0, 2, ErrorMessage = "Nivel de urgencia no valido")]
    public ENivelUrgencia NivelUrgencia { get; set; }

    [JsonIgnore]
    public ICollection<UsoDeRecurso> UsosDeRecurso { get; set; } = [];

    [JsonIgnore]
    public ICollection<Traslado> Traslados { get; set; } = [];

    [JsonIgnore]
    public ICollection<HechiceroEnMision> Hechiceros { get; set; } = [];
    [JsonIgnore]
    public ICollection<TecnicaMalditaAplicada> Tecnicas { get; set; } = [];
    


    public enum EEstadoMision
    {
        Pendiente,
        EnProgreso,
        CompletadaConExito,
        CompletadaConFracaso,
        Cancelada
    }

    public enum ENivelUrgencia
    {
        Planificada,
        Urgente,
        EmergenciaCritica
    }
}