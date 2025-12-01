using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GestionDeMisiones.Models;

public class TecnicaMaldita
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Nombre { get; set; }
    [Required]
    public ETipoTecnica Tipo { get; set; }
    public int EfectividadProm { get; set; } = 0;
    public string CondicionesDeUso { get; set; } = "ninguna";
    
    [JsonIgnore]
    public ICollection<TecnicaMalditaAplicada> Misiones { get; set; } = [];

    [JsonIgnore]
    public ICollection<TecnicaMalditaDominada> TecnicasMalditasDominadas { get; set; } = [];


    public enum ETipoTecnica
    {
        amplificacion,
        dominio,
        restriccion,
        soporte
    }
}