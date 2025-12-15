using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Data;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Repository;

public class Query4Repository : IQuery4Repository
{
    private readonly AppDbContext _context;

    public Query4Repository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Query4Result>> GetEfectividadTecnicasAsync()
    {
        var resultados = await BuildQuery().ToListAsync();
        ApplyClasificacion(resultados);
        return resultados.OrderByDescending(r => r.PromedioEfectividad).ToList();
    }

    public async Task<List<Query4Result>> GetEfectividadTecnicasPagedAsync(int? cursor, int limit)
    {
        var query = BuildQuery();
        
        if (cursor.HasValue)
            query = query.Where(r => r.HechiceroId > cursor.Value);
        
        var resultados = await query
            .OrderBy(r => r.HechiceroId)
            .Take(limit + 1)
            .ToListAsync();
        
        ApplyClasificacion(resultados);
        return resultados;
    }

    private IQueryable<Query4Result> BuildQuery()
    {
        return _context.TecnicasMalditasDominadas
            .Include(tmd => tmd.Hechicero)
            .Include(tmd => tmd.TecnicaMaldita)
            .Where(tmd => tmd.TecnicaMaldita != null)
            .GroupBy(tmd => new
            {
                tmd.HechiceroId,
                tmd.Hechicero.Name,
                tmd.Hechicero.Grado
            })
            .Select(g => new Query4Result
            {
                HechiceroId = g.Key.HechiceroId,
                NombreHechicero = g.Key.Name,
                Grado = g.Key.Grado.ToString(),
                CantidadTecnicas = g.Count(),
                PromedioEfectividad = g.Average(tmd => tmd.TecnicaMaldita.EfectividadProm)
            });
    }

    private void ApplyClasificacion(List<Query4Result> resultados)
    {
        foreach (var resultado in resultados)
        {
            resultado.Clasificacion = resultado.PromedioEfectividad switch
            {
                >= 80 => "Alta",
                >= 50 => "Media",
                _ => "Baja"
            };
        }
    }
}