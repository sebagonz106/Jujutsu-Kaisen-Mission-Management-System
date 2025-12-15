// ITrasladoRepository.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using GestionDeMisiones.Models;
namespace GestionDeMisiones.IRepository;
public interface ITrasladoRepository
{
    Task<IEnumerable<Traslado>> GetAllAsync();
    Task<Traslado> GetByIdAsync(int id);
    Task<Traslado?> GetByIdConRelacionesAsync(int id);
    Task<Traslado> AddAsync(Traslado traslado);
    Task UpdateAsync(Traslado traslado);
    Task DeleteAsync(Traslado traslado);
    
    Task<bool> AgregarHechiceroAsync(Traslado traslado, Hechicero hechicero);
    Task<bool> QuitarHechiceroAsync(Traslado traslado, int hechiceroId);
    Task<bool> AgregarPersonalApoyoAsync(Traslado traslado, PersonalDeApoyo personal);
    Task<bool> QuitarPersonalApoyoAsync(Traslado traslado, int personalId);
    Task<IEnumerable<Hechicero>> GetHechicerosEnTrasladoAsync(int trasladoId);
    Task<IEnumerable<PersonalDeApoyo>> GetPersonalApoyoEnTrasladoAsync(int trasladoId);
}