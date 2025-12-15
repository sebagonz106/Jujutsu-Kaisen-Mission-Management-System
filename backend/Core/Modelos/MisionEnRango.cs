namespace GestionDeMisiones.Models;

public class MisionEnRango
{
    public int MisionId { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }

    public string Ubicacion { get; set; }
    public string Maldicion { get; set; }

    public List<string> Hechiceros { get; set; } = new();
    public List<string> Tecnicas { get; set; } = new();
}
