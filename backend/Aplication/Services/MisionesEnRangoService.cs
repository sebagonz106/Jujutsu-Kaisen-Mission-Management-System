using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using  GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service;

public class MisionesEnRangoService : IMisionesEnRangoService
{
    private readonly IMisionesEnRangoRepository _repo;

    public MisionesEnRangoService(IMisionesEnRangoRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<MisionEnRango>> GetMisionesCompletadasPorRango(
        DateTime desde, DateTime hasta)
    {
        return await _repo.GetMisionesCompletadasPorRango(desde, hasta);
    }
}
