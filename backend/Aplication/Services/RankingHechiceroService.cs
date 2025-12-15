using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.IService;

namespace GestionDeMisiones.Services;

public class RankingHechiceroService : IRankingHechiceroService
{
    private readonly IRankingHechiceroRepository _repository;

    public RankingHechiceroService(IRankingHechiceroRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<RankingHechicero>> GetTopHechicerosPorNivelYUbicacion(int ubicacionId)
    {
        return await _repository.GetTopHechicerosPorNivelYUbicacion(ubicacionId);
    }

    public async Task<IEnumerable<RankingHechicero>> GetTopHechicerosPorNivelYUbicacionAsync(int ubicacionId)
    {
        return await _repository.GetTopHechicerosPorNivelYUbicacionAsync(ubicacionId);
    }
}
