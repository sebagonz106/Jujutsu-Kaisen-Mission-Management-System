using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace GestionDeMisiones.Models;
public class PersonalDeApoyo
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; }
} 