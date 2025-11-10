using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service;

public class TecnicaMalditaDominadaService : ITecnicaMalditaDominadaService
{
    private readonly ITecnicaMalditaDominadaRepository _repo;
    private readonly IHechiceroRepository _hechiceroRepo;
    private readonly ITecnicaMalditaRepository _tecnicaMalditaRepo;

    public TecnicaMalditaDominadaService(
        ITecnicaMalditaDominadaRepository repo,
        IHechiceroRepository hechiceroRepo,
        ITecnicaMalditaRepository tecnicaMalditaRepo)
    {
        _repo = repo;
        _hechiceroRepo = hechiceroRepo;
        _tecnicaMalditaRepo = tecnicaMalditaRepo;
    }

    public async Task<IEnumerable<TecnicaMalditaDominada>> GetAllAsync()
        => await _repo.GetAllAsync();

    public async Task<TecnicaMalditaDominada?> GetByIdAsync(int id)
        => await _repo.GetByIdAsync(id);

    public async Task<TecnicaMalditaDominada> CreateAsync(TecnicaMalditaDominada tecnicaDominada)
    {
        // Validaciones de negocio
        await ValidateRelationsAsync(tecnicaDominada);

        if (tecnicaDominada.NivelDeDominio < 0 || tecnicaDominada.NivelDeDominio > 100)
            throw new ArgumentException("El nivel de dominio debe estar entre 0 y 100");

        // Validar que no existe ya esta combinación
        var existeRelacion = await _repo.ExistsAsync(tecnicaDominada.HechiceroId, tecnicaDominada.TecnicaMalditaId);
        if (existeRelacion)
            throw new ArgumentException("Este hechicero ya domina esta técnica maldita");

        return await _repo.AddAsync(tecnicaDominada);
    }

    public async Task<bool> UpdateAsync(int id, TecnicaMalditaDominada tecnicaDominada)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null)
            return false;

        // Validaciones de negocio
        await ValidateRelationsAsync(tecnicaDominada);

        if (tecnicaDominada.NivelDeDominio < 0 || tecnicaDominada.NivelDeDominio > 100)
            throw new ArgumentException("El nivel de dominio debe estar entre 0 y 100");

        // Validar que no existe duplicado (excluyendo el actual)
        var existeDuplicado = await _repo.ExistsAsync(
            tecnicaDominada.HechiceroId, 
            tecnicaDominada.TecnicaMalditaId, 
            id);

        if (existeDuplicado)
            throw new ArgumentException("Ya existe esta combinación de hechicero y técnica maldita");

        // Actualizar solo campos permitidos
        existing.HechiceroId = tecnicaDominada.HechiceroId;
        existing.TecnicaMalditaId = tecnicaDominada.TecnicaMalditaId;
        existing.NivelDeDominio = tecnicaDominada.NivelDeDominio;

        await _repo.UpdateAsync(existing);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null)
            return false;

        await _repo.DeleteAsync(existing);
        return true;
    }

    private async Task ValidateRelationsAsync(TecnicaMalditaDominada tecnicaDominada)
    {
        // Validar que el hechicero existe
        var hechicero = await _hechiceroRepo.GetByIdAsync(tecnicaDominada.HechiceroId);
        if (hechicero == null)
            throw new ArgumentException("El hechicero especificado no existe");

        // Validar que la técnica maldita existe
        var tecnicaMaldita = await _tecnicaMalditaRepo.GetByIdAsync(tecnicaDominada.TecnicaMalditaId);
        if (tecnicaMaldita == null)
            throw new ArgumentException("La técnica maldita especificada no existe");
    }
}