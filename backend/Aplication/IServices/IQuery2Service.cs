using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IQuery2Service
{
    Task<IEnumerable<Query2Result>> GetMisionesPorHechiceroAsync(int hechiceroId);
}