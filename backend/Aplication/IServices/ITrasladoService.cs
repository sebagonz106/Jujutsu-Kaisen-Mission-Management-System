// ITrasladoService.cs

using GestionDeMisiones.Models;
namespace GestionDeMisiones.IService;
public interface ITrasladoService
{
    Task<IEnumerable<Traslado>> GetAllAsync();
    Task<Traslado> GetByIdAsync(int id);
    Task<Traslado> CreateAsync(Traslado traslado);
    Task<bool> UpdateAsync(int id, Traslado traslado);
    Task<bool> DeleteAsync(int id);
    
    Task<bool> AgregarHechiceroAsync(int trasladoId, int hechiceroId);
    Task<bool> QuitarHechiceroAsync(int trasladoId, int hechiceroId);
    Task<bool> AgregarPersonalApoyoAsync(int trasladoId, int personalId);
    Task<bool> QuitarPersonalApoyoAsync(int trasladoId, int personalId);
    Task<IEnumerable<Hechicero>> GetHechicerosEnTrasladoAsync(int trasladoId);
    Task<IEnumerable<PersonalDeApoyo>> GetPersonalApoyoEnTrasladoAsync(int trasladoId);
}