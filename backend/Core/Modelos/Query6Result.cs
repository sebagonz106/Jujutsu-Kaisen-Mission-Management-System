namespace GestionDeMisiones.Models;

public class Query6Result
{
    public int HechiceroId { get; set; }
    public string? NombreHechicero { get; set; }
    public string? Grado { get; set; }
    public List<DiscipuloInfo> Discipulos { get; set; } = new();
    public int MisionesTotales { get; set; }
    public int MisionesExitosas { get; set; }
    public int MisionesFallidas { get; set; }
    public double PorcentajeExito { get; set; }
    
    public class DiscipuloInfo
    {
        public int DiscipuloId { get; set; }
        public string? NombreDiscipulo { get; set; }
        public string? GradoDiscipulo { get; set; }
        public string? TipoRelacion { get; set; }
    }
}