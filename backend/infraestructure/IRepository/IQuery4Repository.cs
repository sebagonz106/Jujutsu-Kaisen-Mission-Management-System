using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface IQuery4Repository
{
    Task<IEnumerable<Query4Result>> GetEfectividadTecnicasAsync();
    Task<List<Query4Result>> GetEfectividadTecnicasPagedAsync(int? cursor, int limit);
}