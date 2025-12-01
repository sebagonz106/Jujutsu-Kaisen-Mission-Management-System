using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace GestionDeMisiones.Models;

public class HechiceroEnMision
{
    [Key]
    public int Id { get; set; }
    [ForeignKey("Hechicero")]
    [Required]
    public int HechiceroId { get; set; }
    [Required]
    public Hechicero Hechicero { get; set; }
    [ForeignKey("Mision")]
    [Required]
    public int MisionId { get; set; }
    [Required]
    public Mision Mision { get; set; }
}