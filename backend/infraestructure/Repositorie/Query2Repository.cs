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
        return await _context.HechiceroEnMision
            .Where(hm => hm.HechiceroId == hechiceroId)
            .Include(hm => hm.Mision)
            .Select(hm => new Query2Result
            {
                FechaMision = hm.Mision.FechaYHoraDeInicio,
                Resultado = hm.Mision.Estado == Mision.EEstadoMision.CompletadaConExito ? "Éxito" : 
                           hm.Mision.Estado == Mision.EEstadoMision.CompletadaConFracaso ? "Fracaso" : "En proceso"
            })
            .OrderByDescending(m => m.FechaMision)
            .ToListAsync();
    }
}