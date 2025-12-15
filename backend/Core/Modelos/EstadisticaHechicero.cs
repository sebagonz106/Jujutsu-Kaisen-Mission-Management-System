namespace GestionDeMisiones.Models;
public class EstadisticaHechicero
{
    public int HechiceroId { get; set; }
    public string Nombre { get; set; }
    public string Grado { get; set; }
    public int MisionesTotales { get; set; }
    public int MisionesExitosas { get; set; }
    public double PorcentajeEfectividad { get; set; }
}
