using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Data;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Repository;

public class Query6Repository : IQuery6Repository
{
    private readonly AppDbContext _context;

    public Query6Repository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Query6Result>> GetRelacionHechiceroDiscipulosAsync()
    {
        var hechiceros = await _context.Hechiceros.ToListAsync();
        return await BuildResultsForHechiceros(hechiceros);
    }

    public async Task<List<Query6Result>> GetRelacionHechiceroDiscipulosPagedAsync(int? cursor, int limit)
    {
        var query = _context.Hechiceros.AsQueryable();
        
        if (cursor.HasValue)
            query = query.Where(h => h.Id > cursor.Value);
        
        var hechiceros = await query
            .OrderBy(h => h.Id)
            .Take(limit + 1)
            .ToListAsync();
        
        return await BuildResultsForHechiceros(hechiceros);
    }

    private async Task<List<Query6Result>> BuildResultsForHechiceros(List<Hechicero> hechiceros)
    {
        var resultados = new List<Query6Result>();

        foreach (var hechicero in hechiceros)
        {
            var discipulos = await _context.Subordinaciones
                .Where(s => s.MaestroId == hechicero.Id && s.Activa)
                .Include(s => s.Discipulo)
                .Select(s => new Query6Result.DiscipuloInfo
                {
                    DiscipuloId = s.Discipulo.Id,
                    NombreDiscipulo = s.Discipulo.Name,
                    GradoDiscipulo = s.Discipulo.Grado.ToString(),
                    TipoRelacion = s.TipoRelacion.ToString()
                })
                .ToListAsync();

            var misionesHechicero = await _context.HechiceroEnMision
                .Where(hm => hm.HechiceroId == hechicero.Id)
                .Include(hm => hm.Mision)
                .ToListAsync();

            var misionesTotales = misionesHechicero.Count;
            var misionesExitosas = misionesHechicero
                .Count(hm => hm.Mision.Estado == Mision.EEstadoMision.CompletadaConExito);
            var misionesFallidas = misionesHechicero
                .Count(hm => hm.Mision.Estado == Mision.EEstadoMision.CompletadaConFracaso);

            var porcentajeExito = misionesTotales > 0 
                ? (misionesExitosas * 100.0) / misionesTotales 
                : 0;

            resultados.Add(new Query6Result
            {
                HechiceroId = hechicero.Id,
                NombreHechicero = hechicero.Name,
                Grado = hechicero.Grado.ToString(),
                Discipulos = discipulos,
                MisionesTotales = misionesTotales,
                MisionesExitosas = misionesExitosas,
                MisionesFallidas = misionesFallidas,
                PorcentajeExito = porcentajeExito
            });
        }

        return resultados;
    }
}