using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service;

public class RecursoService : IRecursoService
{
    private readonly IRecursoRepository _repo;

    public RecursoService(IRecursoRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<Recurso>> GetAllAsync()
        => await _repo.GetAllAsync();

    public async Task<Recurso?> GetByIdAsync(int id)
        => await _repo.GetByIdAsync(id);

    public async Task<Recurso> CreateAsync(Recurso recurso)
    {
        // Validaciones de negocio
        if (!Enum.IsDefined(typeof(Recurso.ETipoRecurso), recurso.TipoRecurso))
            throw new ArgumentException("Tipo de recurso no válido");

        if (string.IsNullOrWhiteSpace(recurso.Descripcion))
            throw new ArgumentException("La descripción del recurso es obligatoria");

        if (recurso.Descripcion.Length < 5)
            throw new ArgumentException("La descripción debe tener al menos 5 caracteres");

        return await _repo.AddAsync(recurso);
    }

    public async Task<bool> UpdateAsync(int id, Recurso recurso)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null)
            return false;

        // Validaciones de negocio
        if (!Enum.IsDefined(typeof(Recurso.ETipoRecurso), recurso.TipoRecurso))
            throw new ArgumentException("Tipo de recurso no válido");

        if (string.IsNullOrWhiteSpace(recurso.Descripcion))
            throw new ArgumentException("La descripción del recurso es obligatoria");

        if (recurso.Descripcion.Length < 5)
            throw new ArgumentException("La descripción debe tener al menos 5 caracteres");

        // Actualizar solo campos permitidos
        existing.TipoRecurso = recurso.TipoRecurso;
        existing.Descripcion = recurso.Descripcion;

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