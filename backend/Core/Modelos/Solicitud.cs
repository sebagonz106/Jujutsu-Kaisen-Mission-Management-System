using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GestionDeMisiones.Models;


public class Solicitud
{
    [Key]
    public int Id { get; set; }

    // FK explícita para binding desde JSON
    public int MaldicionId { get; set; }

    [ForeignKey("MaldicionId")]
    [JsonIgnore]
    public Maldicion? Maldicion { get; set; }

    public EEstadoSolicitud Estado { get; set; }
}

public enum EEstadoSolicitud
{
    pendiente,
    atendiendose,
    atendida,
}