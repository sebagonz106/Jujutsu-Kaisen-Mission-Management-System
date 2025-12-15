using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;
public interface IRankingHechiceroService
{
    Task<IEnumerable<RankingHechicero>> GetTopHechicerosPorNivelYUbicacion(int ubicacionId);
}
