using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IQuery4Service
{
    Task<IEnumerable<Query4Result>> GetEfectividadTecnicasAsync();
    Task<(IEnumerable<Query4Result> items, int? nextCursor, bool hasMore)> GetEfectividadTecnicasPagedAsync(int? cursor, int limit);
}