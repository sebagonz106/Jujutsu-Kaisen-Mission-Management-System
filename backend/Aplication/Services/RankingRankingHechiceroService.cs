using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.IService;

namespace GestionDeMisiones.Service;

public class RankingHechiceroService : IRankingHechiceroService
{
    private readonly IRankingHechiceroRepository _repository;

    public RankingHechiceroService(IRankingHechiceroRepository repository)
    {
        _repository = repository;
    }

    public Task<IEnumerable<RankingHechicero>> GetTopHechicerosPorNivelYUbicacion(int ubicacionId)
        => _repository.GetTopHechicerosPorNivelYUbicacion(ubicacionId);
}

