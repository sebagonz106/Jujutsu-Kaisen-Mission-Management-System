using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface IQuery6Repository
{
    Task<IEnumerable<Query6Result>> GetRelacionHechiceroDiscipulosAsync();
}