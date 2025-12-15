using GestionDeMisiones.Data;
using GestionDeMisiones.Models;
namespace GestionDeMisiones.IService;
public interface IMaldicionesEnEstadosService
{
    Task<IEnumerable<MaldicionEnEstado>> ConsultarPorEstadoAsync(
        Maldicion.EEstadoActual estado);
    
    Task<(IEnumerable<MaldicionEnEstado> items, int? nextCursor, bool hasMore)> ConsultarPorEstadoPagedAsync(
        Maldicion.EEstadoActual estado, int? cursor, int limit);
}
