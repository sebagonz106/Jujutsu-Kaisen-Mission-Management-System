using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IPersonalDeApoyoService
{
    Task<IEnumerable<PersonalDeApoyo>> GetAllAsync();
    Task<(IEnumerable<PersonalDeApoyo> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit);
    Task<PersonalDeApoyo?> GetByIdAsync(int id);
    Task<PersonalDeApoyo> CreateAsync(PersonalDeApoyo personal);
    Task<bool> UpdateAsync(int id, PersonalDeApoyo personal);
    Task<bool> DeleteAsync(int id);
}