using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IQuery6Service
{
    Task<IEnumerable<Query6Result>> GetRelacionHechiceroDiscipulosAsync();
}