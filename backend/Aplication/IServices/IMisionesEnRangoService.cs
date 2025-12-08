using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IMisionesEnRangoService
{
    Task<IEnumerable<MisionEnRango>> GetMisionesCompletadasPorRango(
        DateTime desde, DateTime hasta);
}
