using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IEstadisticasHechiceroService
{
    Task<IEnumerable<EstadisticaHechicero>> GetEfectividadMediosVsAltos();
    Task<(IEnumerable<EstadisticaHechicero> items, int? nextCursor, bool hasMore)> GetEfectividadMediosVsAltosPagedAsync(int? cursor, int limit);
}
