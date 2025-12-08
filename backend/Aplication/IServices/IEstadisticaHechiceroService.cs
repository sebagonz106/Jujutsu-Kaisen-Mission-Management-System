using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IEstadisticasHechiceroService
{
    Task<IEnumerable<EstadisticaHechicero>> GetEfectividadMediosVsAltos();
}
