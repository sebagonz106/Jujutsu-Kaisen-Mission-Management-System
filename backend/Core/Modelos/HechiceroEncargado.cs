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
    public int HechiceroId { get; set; }
    public Hechicero? Hechicero { get; set; }
    
    [ForeignKey("Solicitud")]
    public int SolicitudId { get; set; }
    [DeleteBehavior(DeleteBehavior.Restrict)]
    public Solicitud? Solicitud { get; set; }
    
    [ForeignKey("Mision")]
    public int MisionId { get; set; }
    public Mision? Mision { get; set; }
}