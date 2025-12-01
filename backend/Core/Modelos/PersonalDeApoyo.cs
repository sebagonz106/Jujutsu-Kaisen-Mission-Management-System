using System.ComponentModel.DataAnnotations;
using static GestionDeMisiones.Models.Hechicero;

namespace GestionDeMisiones.Models;

public class PersonalDeApoyo
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = "";

    public EEstado Estado { get; set; } = EEstado.activo;
} 