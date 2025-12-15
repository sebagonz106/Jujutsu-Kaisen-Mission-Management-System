using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface IQuery6Repository
{
    Task<IEnumerable<Query6Result>> GetRelacionHechiceroDiscipulosAsync();
    Task<List<Query6Result>> GetRelacionHechiceroDiscipulosPagedAsync(int? cursor, int limit);
}