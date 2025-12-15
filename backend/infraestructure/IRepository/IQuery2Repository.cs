using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface IQuery2Repository
{
    Task<IEnumerable<Query2Result>> GetMisionesPorHechiceroAsync(int hechiceroId);
}