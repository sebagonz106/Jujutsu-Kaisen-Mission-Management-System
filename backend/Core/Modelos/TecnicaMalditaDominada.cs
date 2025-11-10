using System.ComponentModel.DataAnnotations;
using GestionDeMisiones.Models;

public class TecnicaMalditaDominada
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int HechiceroId { get; set; }
    public Hechicero? Hechicero { get; set; }
    
    [Required]
    public int TecnicaMalditaId { get; set; }
    public TecnicaMaldita? TecnicaMaldita { get; set; }

    [Required]
    [Range(0, 100)]
    public float NivelDeDominio { get; set; }
}