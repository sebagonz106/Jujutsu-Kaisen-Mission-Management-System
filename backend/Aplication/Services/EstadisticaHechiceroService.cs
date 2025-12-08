using GestionDeMisiones.IService;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;


namespace GestionDeMisiones.Service;



public class EstadisticasHechiceroService : IEstadisticasHechiceroService
{
    private readonly IEstadisticasHechiceroRepository _repo;

    public EstadisticasHechiceroService(IEstadisticasHechiceroRepository repo)
    {
        _repo = repo;
    }

    public Task<IEnumerable<EstadisticaHechicero>> GetEfectividadMediosVsAltos()
        => _repo.GetEfectividadMediosVsAltos();
}