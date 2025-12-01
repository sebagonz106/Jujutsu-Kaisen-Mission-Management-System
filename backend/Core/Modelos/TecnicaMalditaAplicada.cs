using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace GestionDeMisiones.Models;

public class TecnicaMalditaAplicada
{
    [Key]
    public int Id { get; set; }
    [ForeignKey("TecnicaMaldita")]
    [Required]
    public int TecnicaMalditaId { get; set; }
    [Required]
    public TecnicaMaldita TecnicaMaldita { get; set; }
    [ForeignKey("Misiones")]
    [Required]
    public int MisionId { get; set; }
    [Required]
    public Mision Mision { get; set; } 
    [Range(0,100)]
    public float Efectividad{ get; set; }
}