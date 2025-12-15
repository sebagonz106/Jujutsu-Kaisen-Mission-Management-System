using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface IQuery2Repository
{
    Task<IEnumerable<Query2Result>> GetMisionesPorHechiceroAsync(int hechiceroId);
    Task<List<Query2Result>> GetMisionesPorHechiceroPagedAsync(int hechiceroId, int? cursor, int limit);
}