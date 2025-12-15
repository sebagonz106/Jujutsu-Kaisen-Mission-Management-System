using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Data;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Repository;

public class Query2Repository : IQuery2Repository
{
    private readonly AppDbContext _context;

    public Query2Repository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Query2Result>> GetMisionesPorHechiceroAsync(int hechiceroId)
    {
        return await BuildQuery(hechiceroId)
            .OrderByDescending(m => m.FechaMision)
            .ToListAsync();
    }

    public async Task<List<Query2Result>> GetMisionesPorHechiceroPagedAsync(int hechiceroId, int? cursor, int limit)
    {
        var query = BuildQuery(hechiceroId);
        
        if (cursor.HasValue)
            query = query.Where(m => m.MisionId > cursor.Value);
        
        return await query
            .OrderBy(m => m.MisionId)
            .Take(limit + 1)
            .ToListAsync();
    }

    private IQueryable<Query2Result> BuildQuery(int hechiceroId)
    {
        return _context.HechiceroEnMision
            .Where(hm => hm.HechiceroId == hechiceroId)
            .Include(hm => hm.Mision)
            .Select(hm => new Query2Result
            {
                MisionId = hm.MisionId,
                FechaMision = hm.Mision.FechaYHoraDeInicio,
                Resultado = hm.Mision.Estado == Mision.EEstadoMision.CompletadaConExito ? "Éxito" : 
                           hm.Mision.Estado == Mision.EEstadoMision.CompletadaConFracaso ? "Fracaso" : "En proceso"
            });
    }
}