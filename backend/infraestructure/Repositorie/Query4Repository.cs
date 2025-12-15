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
        var query = _context.TecnicasMalditasDominadas
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

        var resultados = await query.ToListAsync();

        foreach (var resultado in resultados)
        {
            resultado.Clasificacion = resultado.PromedioEfectividad switch
            {
                >= 80 => "Alta",
                >= 50 => "Media",
                _ => "Baja"
            };
        }

        return resultados.OrderByDescending(r => r.PromedioEfectividad).ToList();
    }
}