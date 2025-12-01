using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service;

public class PersonalDeApoyoService : IPersonalDeApoyoService
{
    private readonly IPersonalDeApoyoRepository _repo;

    public PersonalDeApoyoService(IPersonalDeApoyoRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<PersonalDeApoyo>> GetAllAsync()
        => await _repo.GetAllAsync();

    public async Task<(IEnumerable<PersonalDeApoyo> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit)
    {
        if (limit <= 0) limit = 20;
        if (limit > 100) limit = 100;
        var list = await _repo.GetPagedAsync(cursor, limit);
        var hasMore = list.Count > limit;
        if (hasMore) list.RemoveAt(list.Count - 1);
        int? nextCursor = list.Count > 0 ? list.Last().Id : null;
        return (list, nextCursor, hasMore);
    }

    public async Task<PersonalDeApoyo?> GetByIdAsync(int id)
        => await _repo.GetByIdAsync(id);

    public async Task<PersonalDeApoyo> CreateAsync(PersonalDeApoyo personal)
    {
        // Validaciones de negocio
        if (string.IsNullOrWhiteSpace(personal.Name))
            throw new ArgumentException("El nombre del personal de apoyo es obligatorio.");

        if (personal.Name.Length < 2)
            throw new ArgumentException("El nombre debe tener al menos 2 caracteres.");

        return await _repo.AddAsync(personal);
    }

    public async Task<bool> UpdateAsync(int id, PersonalDeApoyo personal)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null)
            return false;

        // Validaciones de negocio
        if (string.IsNullOrWhiteSpace(personal.Name))
            throw new ArgumentException("El nombre del personal de apoyo es obligatorio.");

        if (personal.Name.Length < 2)
            throw new ArgumentException("El nombre debe tener al menos 2 caracteres.");

        // Actualizar solo campos permitidos
        existing.Name = personal.Name;
        existing.Estado = personal.Estado;

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