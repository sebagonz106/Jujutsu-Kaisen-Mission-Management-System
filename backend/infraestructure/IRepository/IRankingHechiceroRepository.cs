using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;
public interface IRankingHechiceroRepository
{
    Task<IEnumerable<RankingHechicero>> GetTopHechicerosPorNivelYUbicacion(int ubicacionId);
    Task<List<RankingHechicero>> GetTopHechicerosPorNivelYUbicacionPagedAsync(int ubicacionId, int? cursor, int limit);
}
