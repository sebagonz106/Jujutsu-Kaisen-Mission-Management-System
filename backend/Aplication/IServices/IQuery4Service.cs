using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IQuery4Service
{
    Task<IEnumerable<Query4Result>> GetEfectividadTecnicasAsync();
}