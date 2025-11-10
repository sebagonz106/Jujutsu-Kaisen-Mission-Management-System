using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace GestionDeMisiones.Models;


public class Solicitud
{
    [Key]
    public int Id { get; set; }
    [Required]
    public Maldicion Maldicion { get; set; }

    public EEstadoSolicitud Estado { get; set; }



}

public enum EEstadoSolicitud
{
    pendiente,
    atendiendose,
    atendida,
}