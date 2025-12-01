using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace GestionDeMisiones.Models;

public class Traslado
{
    [Key]
    public int Id{ get; set; }
    [DataType(DataType.DateTime)]
    public DateTime Fecha { get; set; }
    public EEstadoTraslado Estado{ get; set; }
    
    [AllowNull]
    public string Motivo { get; set; }
   
    [Required]
    public int OrigenId { get; set; }
    [DeleteBehavior(DeleteBehavior.Restrict)] 
    public Ubicacion? Origen { get; set; }

    [Required]
    public int DestinoId { get; set; }
    [DeleteBehavior(DeleteBehavior.Restrict)]
    public Ubicacion? Destino { get; set; }    

    [Required]
    public int MisionId { get; set; }
    public Mision? Mision { get; set; }

    public ICollection<Hechicero> Hechiceros { get; set; } = new List<Hechicero>();

    /// <summary>
    /// IDs de hechiceros para asignar al traslado (usado en create/update).
    /// No se persiste directamente, se usa para actualizar la relación.
    /// </summary>
    [NotMapped]
    public List<int>? HechicerosIds { get; set; }





    public enum EEstadoTraslado
    {
        programado,
        en_curso,
        finalizado
    }
} 