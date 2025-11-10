using GestionDeMisiones.IService;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service
{
    public class UbicacionService : IUbicacionService
    {
        private readonly IUbicacionRepository _repository;

        public UbicacionService(IUbicacionRepository repository)
        {
            _repository = repository;
        }

        public Task<IEnumerable<Ubicacion>> GetAllAsync() => _repository.GetAllAsync();
        public Task<Ubicacion?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);
        public Task<Ubicacion> AddAsync(Ubicacion ubicacion) => _repository.AddAsync(ubicacion);
        public Task<bool> DeleteAsync(int id) => _repository.DeleteAsync(id);
        public Task<Ubicacion?> UpdateAsync(int id, Ubicacion ubicacion) => _repository.UpdateAsync(id, ubicacion);
    }
}
