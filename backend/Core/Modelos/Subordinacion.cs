using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionDeMisiones.Models;

public class Subordinacion
{
    [Key]
    public int Id { get; set; }
    
    [ForeignKey("HechiceroMaestro")]
    [Required]
    public int MaestroId { get; set; }
    public Hechicero? Maestro { get; set; }
    
    [ForeignKey("HechiceroDiscipulo")]
    [Required]
    public int DiscipuloId { get; set; }
    public Hechicero? Discipulo { get; set; }
    
    [Required]
    public DateTime FechaInicio { get; set; } = DateTime.UtcNow;
    
    public DateTime? FechaFin { get; set; }
    
    [Required]
    public ETipoRelacion TipoRelacion { get; set; }
    
    [Required]
    public bool Activa { get; set; } = true;
    
    public enum ETipoRelacion
    {
        Tutoría,
        Supervisión,
        LiderazgoEquipo,
        Entrenamiento
    }
}