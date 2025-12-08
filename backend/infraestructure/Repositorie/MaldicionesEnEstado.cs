using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Data;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Models;

namespace GestionDeMisiones.Repository;

public class MaldicionesEnEstadoRepository : IMaldicionesEnEstadoRepository
{
    private readonly AppDbContext _context;

    public MaldicionesEnEstadoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MaldicionEnEstado>> GetMaldicionesPorEstadoAsync(
        Maldicion.EEstadoActual estado)
    {
        return await _context.Maldiciones
            .Where(m => m.EstadoActual == estado)
            .Include(m => m.UbicacionDeAparicion)
            .Select(m => new 
            {
                Maldicion = m,
                HechiceroEncargado = _context.HechiceroEncargado
                    .Include(h => h.Hechicero)
                    .FirstOrDefault(h => h.Solicitud.Maldicion.Id == m.Id)
            })
            .Select(x => new MaldicionEnEstado
            {
                NombreMaldicion = x.Maldicion.Nombre,
                Ubicacion = x.Maldicion.UbicacionDeAparicion.Nombre,
                Grado = x.Maldicion.Grado.ToString(),
                NombreHechicero = x.HechiceroEncargado != null 
                    ? x.HechiceroEncargado.Hechicero.Name
                    : "No asignado"
            })
            .ToListAsync();
    }
}
