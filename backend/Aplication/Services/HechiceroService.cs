// Services/HechiceroService.cs
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IRepository;
namespace GestionDeMisiones.Service;
public class HechiceroService : IHechiceroService
{
    private readonly IHechiceroRepository _repo;

    public HechiceroService(IHechiceroRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<Hechicero>> GetAllAsync()
        => await _repo.GetAllAsync();

    public async Task<Hechicero?> GetByIdAsync(int id)
        => await _repo.GetByIdAsync(id);

    public async Task<Hechicero> CreateAsync(Hechicero hechicero)
    {
        // 🔸 Reglas de negocio o validaciones adicionales
        if (string.IsNullOrWhiteSpace(hechicero.Name))
            throw new ArgumentException("El nombre del hechicero es obligatorio.");

        if (hechicero.Experiencia < 0)
            throw new ArgumentException("La experiencia no puede ser negativa.");

        return await _repo.AddAsync(hechicero);
    }

    public async Task<bool> UpdateAsync(int id, Hechicero hechicero)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null)
            return false;

        // Actualizar solo campos permitidos
        existing.Name = hechicero.Name;
        existing.Estado = hechicero.Estado;
        existing.Experiencia = hechicero.Experiencia;
        existing.Grado = hechicero.Grado;
        existing.TecnicaPrincipal = hechicero.TecnicaPrincipal;

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
