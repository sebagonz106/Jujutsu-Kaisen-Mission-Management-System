using GestionDeMisiones.Models;
using GestionDeMisiones.Data;
using GestionDeMisiones.IRepository;
using Microsoft.EntityFrameworkCore;


namespace GestionDeMisiones.Repository;


public class MisionesEnRangoRepository : IMisionesEnRangoRepository
{
    private readonly AppDbContext _context;

    public MisionesEnRangoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MisionEnRango>> GetMisionesCompletadasPorRango(DateTime desde, DateTime hasta)
    {
        return await BuildQuery(desde, hasta).ToListAsync();
    }

    public async Task<List<MisionEnRango>> GetMisionesCompletadasPorRangoPagedAsync(
        DateTime desde, DateTime hasta, int? cursor, int limit)
    {
        var baseQuery = _context.Misiones
            .Where(m =>
                m.Estado == Mision.EEstadoMision.CompletadaConExito &&
                m.FechaYHoraDeInicio >= desde &&
                m.FechaYHoraDeFin <= hasta
            );

        if (cursor.HasValue)
            baseQuery = baseQuery.Where(m => m.Id > cursor.Value);

        return await baseQuery
            .OrderBy(m => m.Id)
            .Take(limit + 1)
            .Include(m => m.Ubicacion)
            .Include(m => m.Hechiceros)
                .ThenInclude(hm => hm.Hechicero)
            .Include(m => m.Tecnicas)
                .ThenInclude(t => t.TecnicaMaldita)
            .Select(m => new MisionEnRango
            {
                MisionId = m.Id,
                FechaInicio = m.FechaYHoraDeInicio,
                FechaFin = m.FechaYHoraDeFin,
                Ubicacion = m.Ubicacion.Nombre,

                Maldicion = _context.HechiceroEncargado
                    .Where(h => h.MisionId == m.Id)
                    .Select(h => h.Solicitud == null
                    ? null
                    : h.Solicitud.Maldicion == null
                    ? null
                    :h.Solicitud.Maldicion.Nombre
                    )
                    .FirstOrDefault(),

                Hechiceros = m.Hechiceros
                    .Select(h => h.Hechicero.Name)
                    .ToList(),

                Tecnicas = m.Tecnicas
                    .Select(t => t.TecnicaMaldita.Nombre)
                    .ToList()
            })
            .ToListAsync();
    }

    private IQueryable<MisionEnRango> BuildQuery(DateTime desde, DateTime hasta)
    {
        return _context.Misiones
            .Where(m =>
                m.Estado == Mision.EEstadoMision.CompletadaConExito &&
                m.FechaYHoraDeInicio >= desde &&
                m.FechaYHoraDeFin <= hasta
            )
            .Include(m => m.Ubicacion)
            .Include(m => m.Hechiceros)
                .ThenInclude(hm => hm.Hechicero)
            .Include(m => m.Tecnicas)
                .ThenInclude(t => t.TecnicaMaldita)
            .Select(m => new MisionEnRango
            {
                MisionId = m.Id,
                FechaInicio = m.FechaYHoraDeInicio,
                FechaFin = m.FechaYHoraDeFin,
                Ubicacion = m.Ubicacion.Nombre,

               
                Maldicion = _context.HechiceroEncargado
                    .Where(h => h.MisionId == m.Id)
                    .Select(h => h.Solicitud == null
                    ? null
                    : h.Solicitud.Maldicion == null
                    ? null
                    :h.Solicitud.Maldicion.Nombre
                    )
                    .FirstOrDefault(),

                Hechiceros = m.Hechiceros
                    .Select(h => h.Hechicero.Name)
                    .ToList(),

                Tecnicas = m.Tecnicas
                    .Select(t => t.TecnicaMaldita.Nombre)
                    .ToList()
            });
    }
}

