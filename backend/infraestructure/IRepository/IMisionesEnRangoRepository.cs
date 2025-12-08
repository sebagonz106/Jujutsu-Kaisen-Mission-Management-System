using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface IMisionesEnRangoRepository
{
    Task<IEnumerable<MisionEnRango>> GetMisionesCompletadasPorRango(
        DateTime desde, 
        DateTime hasta
    );
}
