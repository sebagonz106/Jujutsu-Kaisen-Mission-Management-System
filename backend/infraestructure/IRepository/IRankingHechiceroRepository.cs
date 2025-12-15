using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;
public interface IRankingHechiceroRepository
{
    Task<IEnumerable<RankingHechicero>> GetTopHechicerosPorNivelYUbicacion(int ubicacionId);
    Task<IEnumerable<RankingHechicero>> GetTopHechicerosPorNivelYUbicacionAsync(int ubicacionId);
}
