using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service;

public class SubordinacionService : ISubordinacionService
{
    private readonly ISubordinacionRepository _repository;
    private readonly IHechiceroRepository _hechiceroRepository;

    public SubordinacionService(ISubordinacionRepository repository, IHechiceroRepository hechiceroRepository)
    {
        _repository = repository;
        _hechiceroRepository = hechiceroRepository;
    }

    public async Task<Subordinacion> GetByIdAsync(int id)
    {
        var subordinacion = await _repository.GetByIdAsync(id);
        if (subordinacion == null)
            throw new KeyNotFoundException($"Subordinación con ID {id} no encontrada.");
        return subordinacion;
    }

    public async Task<IEnumerable<Subordinacion>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Subordinacion> CrearAsync(Subordinacion subordinacion)
    {
        if (subordinacion.MaestroId == subordinacion.DiscipuloId)
            throw new ArgumentException("Un hechicero no puede ser subordinado de sí mismo.");
        
        var maestro = await _hechiceroRepository.GetByIdAsync(subordinacion.MaestroId);
        var discipulo = await _hechiceroRepository.GetByIdAsync(subordinacion.DiscipuloId);
        
        if (maestro == null || discipulo == null)
            throw new ArgumentException("Uno o ambos hechiceros no existen.");
        
        if (await _repository.ExisteRelacionActivaAsync(subordinacion.MaestroId, subordinacion.DiscipuloId))
            throw new InvalidOperationException("Ya existe una relación activa entre estos hechiceros.");
        
        subordinacion.FechaInicio = DateTime.UtcNow;
        subordinacion.Activa = true;
        
        return await _repository.AddAsync(subordinacion);
    }

    public async Task<Subordinacion> ActualizarAsync(int id, Subordinacion subordinacion)
    {
        var existente = await GetByIdAsync(id);
        existente.TipoRelacion = subordinacion.TipoRelacion;
        await _repository.UpdateAsync(existente);
        return existente;
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var subordinacion = await GetByIdAsync(id);
        await _repository.DeleteAsync(subordinacion);
        return true;
    }

    public async Task<bool> ExisteRelacionActivaAsync(int maestroId, int discipuloId)
    {
        return await _repository.ExisteRelacionActivaAsync(maestroId, discipuloId);
    }
}