using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;

namespace GestionDeMisiones.Models;

public class Hechicero
{
    [Key]
    public int Id{ get; set; }
    [Required]
    public string Name{ get; set; }

    public EGrados Grado{ get; set; }

    public int Experiencia{ get; set; }

    public EEstado Estado { get; set; }

    // FK explícita para binding desde JSON
    public int TecnicaPrincipalId { get; set; }

    [ForeignKey("TecnicaPrincipalId")]
    [AllowNull]
    public TecnicaMaldita? TecnicaPrincipal { get; set; }

    [JsonIgnore]
    public ICollection<HechiceroEnMision> Misiones { get; set; } = [];

    [JsonIgnore]
    public ICollection<Traslado> Traslados { get; set; } = [];

    [JsonIgnore]
    public ICollection<TecnicaMalditaDominada> TecnicasMalditasDominadas { get; set; } = [];

    public enum EEstado
    {
        activo,
        lesionado,
        recuperandose,
        baja,
        inactivo
    }


    public enum EGrados
    {
        estudiante,
        aprendiz,
        medio,
        alto,
        especial

    }
}