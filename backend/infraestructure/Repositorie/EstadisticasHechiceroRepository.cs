using GestionDeMisiones.Models;
using GestionDeMisiones.Data;
using GestionDeMisiones.IRepository;
using Microsoft.EntityFrameworkCore;

namespace GestionDeMisiones.Repository;

public class EstadisticasHechiceroRepository : IEstadisticasHechiceroRepository
{
    private readonly AppDbContext _context;

    public EstadisticasHechiceroRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EstadisticaHechicero>> GetEfectividadMediosVsAltos()
    {
        // 1. Obtener misiones de emergencia crítica
        var misionesCriticas =
            from m in _context.Misiones
            where m.NivelUrgencia == Mision.ENivelUrgencia.EmergenciaCritica
            select m;

        // 2. Misiones donde la maldición es de grado especial
        var misionesConMaldicionEspecial =
            from he in _context.HechiceroEncargado
            where he.Solicitud.Maldicion.Grado == Maldicion.EGrado.especial
            select he;

        // 3. Unir misiones críticas con maldiciones especiales
        var misionesFiltradas =
            from m in misionesCriticas
            join he in misionesConMaldicionEspecial
                on m.Id equals he.MisionId
            select new { Mision = m, Hechicero = he.Hechicero };

        // 4. Ahora unimos con los hechiceros que participaron
        var participaciones =
            from hm in _context.HechiceroEnMision
            join mf in misionesFiltradas
                on hm.MisionId equals mf.Mision.Id
            join h in _context.Hechiceros
                on hm.HechiceroId equals h.Id
            where h.Grado == Hechicero.EGrados.medio
               || h.Grado == Hechicero.EGrados.alto
            select new
            {
                HechiceroId = h.Id,
                HechiceroNombre = h.Name,
                Grado = h.Grado,
                MisionId = mf.Mision.Id,
                Exito = mf.Mision.Estado == Mision.EEstadoMision.CompletadaConExito
            };

        // 5. Agrupar por hechicero y calcular porcentajes
        var estadisticas = await participaciones
            .GroupBy(p => new { p.HechiceroId, p.HechiceroNombre, p.Grado })
            .Select(g => new EstadisticaHechicero
            {
                HechiceroId = g.Key.HechiceroId,
                Nombre = g.Key.HechiceroNombre,
                Grado = g.Key.Grado.ToString(),
                MisionesTotales = g.Count(),
                MisionesExitosas = g.Count(x => x.Exito),
                PorcentajeEfectividad = g.Count(x => x.Exito) * 100.0 / g.Count()
            })
            .ToListAsync();

        return estadisticas;
    }
}
