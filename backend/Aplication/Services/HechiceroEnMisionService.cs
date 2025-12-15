using GestionDeMisiones.IService;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;


namespace GestionDeMisiones.Service
{
    public class HechiceroEnMisionService : IHechiceroEnMisionService
    {
        private readonly IHechiceroEnMisionRepository _repository;

        public HechiceroEnMisionService(IHechiceroEnMisionRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<HechiceroEnMision>> GetAllAsync() =>
            await _repository.GetAllAsync();

        public async Task<HechiceroEnMision?> GetByIdAsync(int id) =>
            await _repository.GetByIdAsync(id);

        public async Task<HechiceroEnMision> CreateAsync(HechiceroEnMision hechiceroEnMision)
        {
            await _repository.AddAsync(hechiceroEnMision);
            return hechiceroEnMision;
        }

        public async Task<bool> UpdateAsync(int id, HechiceroEnMision hechiceroEnMision)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Hechicero = hechiceroEnMision.Hechicero;
            existing.Mision = hechiceroEnMision.Mision;
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
