using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GestionDeMisiones.Models;

public class Ubicacion
{
    [Key]
    public int Id{ get; set; }
    [Required]
    public string Nombre { get; set; }
    
    [JsonIgnore]
    public ICollection<Mision>? Misiones { get; set; }
}