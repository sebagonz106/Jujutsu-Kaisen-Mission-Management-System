using GestionDeMisiones.Models;
namespace GestionDeMisiones.IRepository;
public interface IEstadisticasHechiceroRepository
{
    Task<IEnumerable<EstadisticaHechicero>> GetEfectividadMediosVsAltos();
    Task<List<EstadisticaHechicero>> GetEfectividadMediosVsAltosPagedAsync(int? cursor, int limit);
}
