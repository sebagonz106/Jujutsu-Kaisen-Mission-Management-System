using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GestionDeMisiones.Models;

public class Recurso
{
    [Key]
    public int Id { get; set; }

    [Range(0, 3, ErrorMessage = "Tipo de recurso no valido")]
    public ETipoRecurso TipoRecurso { get; set; }

    public string? Descripcion { get; set; } = "";

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