using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;
public interface IMaldicionesEnEstadoRepository
{
    Task<IEnumerable<MaldicionEnEstado>> GetMaldicionesPorEstadoAsync(
        Maldicion.EEstadoActual estado);
}