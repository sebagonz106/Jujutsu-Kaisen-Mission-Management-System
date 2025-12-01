using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GestionDeMisiones.Models;

public class Recurso
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Nombre { get; set; } = "";

    [Range(0, 3, ErrorMessage = "Tipo de recurso no valido")]
    public ETipoRecurso TipoRecurso { get; set; }

    public string? Descripcion { get; set; } = "";

    [Range(0, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor o igual a 0")]
    public int CantidadDisponible { get; set; } = 0;

    [JsonIgnore]
    public ICollection<UsoDeRecurso> UsosDeRecurso { get; set; } = [];

    public enum ETipoRecurso
    {
        EquipamientoDeCombate,
        Herramienta,
        Transporte,
        Suministros,
    }
}