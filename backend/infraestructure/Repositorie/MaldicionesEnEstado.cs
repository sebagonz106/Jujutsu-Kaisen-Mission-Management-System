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
        return await BuildQuery(estado).ToListAsync();
    }

    public async Task<List<MaldicionEnEstado>> GetMaldicionesPorEstadoPagedAsync(
        Maldicion.EEstadoActual estado, int? cursor, int limit)
    {
        var query = _context.Maldiciones
            .Where(m => m.EstadoActual == estado);

        if (cursor.HasValue)
            query = query.Where(m => m.Id > cursor.Value);

        return await query
            .OrderBy(m => m.Id)
            .Take(limit + 1) // fetch one extra to compute hasMore
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
                Id = x.Maldicion.Id,
                NombreMaldicion = x.Maldicion.Nombre,
                Ubicacion = x.Maldicion.UbicacionDeAparicion.Nombre,
                Grado = x.Maldicion.Grado.ToString(),
                NombreHechicero = x.HechiceroEncargado != null 
                    ? x.HechiceroEncargado.Hechicero.Name
                    : "No asignado"
            })
            .ToListAsync();
    }

    private IQueryable<MaldicionEnEstado> BuildQuery(Maldicion.EEstadoActual estado)
    {
        return _context.Maldiciones
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
                Id = x.Maldicion.Id,
                NombreMaldicion = x.Maldicion.Nombre,
                Ubicacion = x.Maldicion.UbicacionDeAparicion.Nombre,
                Grado = x.Maldicion.Grado.ToString(),
                NombreHechicero = x.HechiceroEncargado != null 
                    ? x.HechiceroEncargado.Hechicero.Name
                    : "No asignado"
            });
    }
}
