namespace GestionDeMisiones.Models;

public class RankingHechicero
{
    public string NivelMision { get; set; }
    public int HechiceroId { get; set; }
    public string NombreHechicero { get; set; }
    public int TotalMisiones { get; set; }
    public int MisionesExitosas { get; set; }
    public double PorcentajeExito { get; set; }
}


