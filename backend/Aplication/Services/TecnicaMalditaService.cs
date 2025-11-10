using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service;

public class TecnicaMalditaService : ITecnicaMalditaService
{
    private readonly ITecnicaMalditaRepository _repo;

    public TecnicaMalditaService(ITecnicaMalditaRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<TecnicaMaldita>> GetAllAsync()
        => await _repo.GetAllAsync();

    public async Task<TecnicaMaldita?> GetByIdAsync(int id)
        => await _repo.GetByIdAsync(id);

    public async Task<TecnicaMaldita> CreateAsync(TecnicaMaldita tecnica)
    {
        // Validaciones de negocio
        if (string.IsNullOrWhiteSpace(tecnica.Nombre))
            throw new ArgumentException("El nombre de la técnica maldita es obligatorio");

        if (tecnica.Nombre.Length < 3)
            throw new ArgumentException("El nombre debe tener al menos 3 caracteres");

        if (!Enum.IsDefined(typeof(TecnicaMaldita.ETipoTecnica), tecnica.Tipo))
            throw new ArgumentException("El tipo de técnica especificado no es válido");

        if (tecnica.EfectividadProm < 0 || tecnica.EfectividadProm > 100)
            throw new ArgumentException("La efectividad promedio debe estar entre 0 y 100");

        if (string.IsNullOrWhiteSpace(tecnica.CondicionesDeUso))
            tecnica.CondicionesDeUso = "ninguna";

        return await _repo.AddAsync(tecnica);
    }

    public async Task<bool> UpdateAsync(int id, TecnicaMaldita tecnica)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null)
            return false;

        // Validaciones de negocio
        if (string.IsNullOrWhiteSpace(tecnica.Nombre))
            throw new ArgumentException("El nombre de la técnica maldita es obligatorio");

        if (tecnica.Nombre.Length < 3)
            throw new ArgumentException("El nombre debe tener al menos 3 caracteres");

        if (!Enum.IsDefined(typeof(TecnicaMaldita.ETipoTecnica), tecnica.Tipo))
            throw new ArgumentException("El tipo de técnica especificado no es válido");

        if (tecnica.EfectividadProm < 0 || tecnica.EfectividadProm > 100)
            throw new ArgumentException("La efectividad promedio debe estar entre 0 y 100");

        if (string.IsNullOrWhiteSpace(tecnica.CondicionesDeUso))
            tecnica.CondicionesDeUso = "ninguna";

        // Actualizar solo campos permitidos
        existing.Nombre = tecnica.Nombre;
        existing.Tipo = tecnica.Tipo;
        existing.EfectividadProm = tecnica.EfectividadProm;
        existing.CondicionesDeUso = tecnica.CondicionesDeUso;

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
}