using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

public interface IPersonalDeApoyoRepository
{
    Task<IEnumerable<PersonalDeApoyo>> GetAllAsync();
    Task<List<PersonalDeApoyo>> GetPagedAsync(int? cursor, int limit);
    Task<PersonalDeApoyo?> GetByIdAsync(int id);
    Task<PersonalDeApoyo> AddAsync(PersonalDeApoyo personal);
    Task UpdateAsync(PersonalDeApoyo personal);
    Task DeleteAsync(PersonalDeApoyo personal);
}