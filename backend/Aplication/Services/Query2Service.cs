using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service;

public class Query2Service : IQuery2Service
{
    private readonly IQuery2Repository _repository;
    private readonly IHechiceroRepository _hechiceroRepository;

    public Query2Service(IQuery2Repository repository, IHechiceroRepository hechiceroRepository)
    {
        _repository = repository;
        _hechiceroRepository = hechiceroRepository;
    }

    public async Task<IEnumerable<Query2Result>> GetMisionesPorHechiceroAsync(int hechiceroId)
    {
        var hechicero = await _hechiceroRepository.GetByIdAsync(hechiceroId);
        if (hechicero == null)
        {
            throw new KeyNotFoundException($"Hechicero con ID {hechiceroId} no encontrado.");
        }

        return await _repository.GetMisionesPorHechiceroAsync(hechiceroId);
    }
}