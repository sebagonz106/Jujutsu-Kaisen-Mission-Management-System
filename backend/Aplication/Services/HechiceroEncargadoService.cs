using GestionDeMisiones.IService;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;


namespace GestionDeMisiones.Service
{
    public class HechiceroEncargadoService : IHechiceroEncargadoService
    {
        private readonly IHechiceroEncargadoRepository _repository;

        public HechiceroEncargadoService(IHechiceroEncargadoRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<HechiceroEncargado>> GetAllAsync() =>
            await _repository.GetAllAsync();

        public async Task<HechiceroEncargado?> GetByIdAsync(int id) =>
            await _repository.GetByIdAsync(id);

        public async Task<HechiceroEncargado> CreateAsync(HechiceroEncargado hechiceroEncargado)
        {
            await _repository.AddAsync(hechiceroEncargado);
            return hechiceroEncargado;
        }

        public async Task<bool> UpdateAsync(int id, HechiceroEncargado hechiceroEncargado)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Hechicero = hechiceroEncargado.Hechicero;
            existing.Mision = hechiceroEncargado.Mision;
            existing.Solicitud = hechiceroEncargado.Solicitud;

            await _repository.UpdateAsync(existing);
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            await _repository.DeleteAsync(existing);
            return true;
        }
    }
}
