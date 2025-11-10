using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using Microsoft.EntityFrameworkCore;

namespace GestionDeMisiones.Models;

public class HechiceroEncargado
{
    [Key]
    public int Id { get; set; }
    [ForeignKey("Hechicero")]
    public int HechiceroId{ get; set; }
    [Required]
    public Hechicero Hechicero { get; set; }
    [Required]
    [DeleteBehavior(DeleteBehavior.Restrict)]
    public Solicitud Solicitud { get; set; }
    [ForeignKey("Solicitud")]
    public int SolicitudId{ get; set; }
    [Required]
    public Mision Mision { get; set; }
    [ForeignKey("Mision")]
    public int MisionId{ get; set; }

}