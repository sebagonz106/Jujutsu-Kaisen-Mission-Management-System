using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service;

public class Query6Service : IQuery6Service
{
    private readonly IQuery6Repository _repository;

    public Query6Service(IQuery6Repository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Query6Result>> GetRelacionHechiceroDiscipulosAsync()
    {
        return await _repository.GetRelacionHechiceroDiscipulosAsync();
    }
}