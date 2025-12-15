using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service;

public class Query4Service : IQuery4Service
{
    private readonly IQuery4Repository _repository;

    public Query4Service(IQuery4Repository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Query4Result>> GetEfectividadTecnicasAsync()
    {
        return await _repository.GetEfectividadTecnicasAsync();
    }
}