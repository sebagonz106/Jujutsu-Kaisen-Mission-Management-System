using GestionDeMisiones.Models;

namespace GestionDeMisiones.IService;

public interface IPersonalDeApoyoService
{
    Task<IEnumerable<PersonalDeApoyo>> GetAllAsync();
    Task<PersonalDeApoyo?> GetByIdAsync(int id);
    Task<PersonalDeApoyo> CreateAsync(PersonalDeApoyo personal);
    Task<bool> UpdateAsync(int id, PersonalDeApoyo personal);
    Task<bool> DeleteAsync(int id);
}