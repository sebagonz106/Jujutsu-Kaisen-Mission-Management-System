using GestionDeMisiones.Models;
using GestionDeMisiones.Data;
using GestionDeMisiones.IRepository;
using Microsoft.EntityFrameworkCore;
namespace GestionDeMisiones.Repository;
public class RankingHechiceroRepository : IRankingHechiceroRepository
{
    private readonly AppDbContext _context;

    public RankingHechiceroRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RankingHechicero>> GetTopHechicerosPorNivelYUbicacion(int ubicacionId)
    {
        return await BuildRankingAsync(ubicacionId);
    }

    async Task<IEnumerable<RankingHechicero>> IRankingHechiceroRepository.GetTopHechicerosPorNivelYUbicacionAsync(int ubicacionId)
    {
        return await BuildRankingAsync(ubicacionId);
    }

    private async Task<List<RankingHechicero>> BuildRankingAsync(int ubicacionId)
    {
        var query =
            from hm in _context.HechiceroEnMision
            join m in _context.Misiones on hm.MisionId equals m.Id
            join h in _context.Hechiceros on hm.HechiceroId equals h.Id
            where m.UbicacionId == ubicacionId
            select new
            {
                Nivel = m.NivelUrgencia,
                HechiceroId = h.Id,
                HechiceroNombre = h.Name,
                Exito = m.Estado == Mision.EEstadoMision.CompletadaConExito
            };

        var agrupado = await query
            .GroupBy(x => new { x.Nivel, x.HechiceroId, x.HechiceroNombre })
            .Select(g => new
            {
                g.Key.Nivel,
                g.Key.HechiceroId,
                g.Key.HechiceroNombre,
                Total = g.Count(),
                Exitos = g.Count(x => x.Exito)
            })
            .ToListAsync();

        // Ranking por nivel (Top 3)
        var resultado = agrupado
            .GroupBy(x => x.Nivel)
            .SelectMany(g =>
                g.OrderByDescending(x =>
                        x.Total == 0 ? 0 : (double)x.Exitos / x.Total)
                 .Take(3)
                 .Select(x => new RankingHechicero
                 {
                     NivelMision = g.Key.ToString(),
                     HechiceroId = x.HechiceroId,
                     NombreHechicero = x.HechiceroNombre,
                     TotalMisiones = x.Total,
                     MisionesExitosas = x.Exitos,
                     PorcentajeExito = x.Total == 0 ? 0 : x.Exitos * 100.0 / x.Total
                 })
            )
            .ToList();

        return resultado;
    }
}
