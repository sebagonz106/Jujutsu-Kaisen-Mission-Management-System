using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IQuery6Service
{
    Task<IEnumerable<Query6Result>> GetRelacionHechiceroDiscipulosAsync();
    Task<(IEnumerable<Query6Result> items, int? nextCursor, bool hasMore)> GetRelacionHechiceroDiscipulosPagedAsync(int? cursor, int limit);
}