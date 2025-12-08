using GestionDeMisiones.Data;
using GestionDeMisiones.Models;
namespace GestionDeMisiones.IService;
public interface IMaldicionesEnEstadosService
{
    Task<IEnumerable<MaldicionEnEstado>> ConsultarPorEstadoAsync(
        Maldicion.EEstadoActual estado);
}
