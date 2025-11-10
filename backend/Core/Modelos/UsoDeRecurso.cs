using System.ComponentModel.DataAnnotations;

namespace GestionDeMisiones.Models;

public class UsoDeRecurso
{
    [Key]
    public int Id { get; set; }

    public int MisionId { get; set; }
    public Mision? Mision { get; set; }

    public int RecursoId { get; set; }
    public Recurso? Recurso { get; set; }

    [DataType(DataType.DateTime)]
    public DateTime FechaInicio { get; set; }

    [DataType(DataType.DateTime)]
    public DateTime? FechaFin { get; set; }

    public string? Observaciones { get; set; } = "";
}