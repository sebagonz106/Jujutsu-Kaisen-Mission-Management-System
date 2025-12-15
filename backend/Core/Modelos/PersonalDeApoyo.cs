using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Text.Json.Serialization;

namespace GestionDeMisiones.Models;
public class PersonalDeApoyo
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; }

    [JsonIgnore]
    public ICollection<Traslado> TrasladosSupervisados { get; set; } = [];
} 