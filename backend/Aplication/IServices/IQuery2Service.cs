using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IQuery2Service
{
    Task<IEnumerable<Query2Result>> GetMisionesPorHechiceroAsync(int hechiceroId);
    Task<(IEnumerable<Query2Result> items, int? nextCursor, bool hasMore)> GetMisionesPorHechiceroPagedAsync(int hechiceroId, int? cursor, int limit);
}