using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace GestionDeMisiones.Models;

public class Maldicion
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Nombre { get; set; }

    [DataType(DataType.DateTime)]
    public DateTime FechaYHoraDeAparicion { get; set; }
    [Required]
    public EGrado Grado { get; set; }
    [Required]
    public ETipo Tipo { get; set; }
    [Required]
    public EEstadoActual EstadoActual { get; set; }
    [Required]
    public ENivelPeligro NivelPeligro { get; set; }

    [Required]
    public Ubicacion UbicacionDeAparicion{ get; set; }








    public enum EGrado
    {
        grado_1
        , grado_2
        , grado_3
        , semi_especial
        , especial
    }

    public enum ETipo
    {
        maligna,
        semi_maldicion,
        residual,
        desconocida
    }
    public enum EEstadoActual
    {
        activa,
        en_proceso_de_exorcismo,
        exorcisada,
    }

    public enum ENivelPeligro
    {
        bajo,
        moderado,
        alto
    }
}