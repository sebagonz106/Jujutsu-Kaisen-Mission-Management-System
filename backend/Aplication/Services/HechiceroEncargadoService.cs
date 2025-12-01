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

        public async Task<(IEnumerable<HechiceroEncargado> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit)
        {
            limit = Math.Clamp(limit, 1, 100);
            var items = await _repository.GetPagedAsync(cursor, limit);
            var hasMore = items.Count > limit;
            if (hasMore) items = items.Take(limit).ToList();
            var nextCursor = hasMore && items.Count > 0 ? items[^1].Id : (int?)null;
            return (items, nextCursor, hasMore);
        }

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

            existing.HechiceroId = hechiceroEncargado.HechiceroId;
            existing.MisionId = hechiceroEncargado.MisionId;
            existing.SolicitudId = hechiceroEncargado.SolicitudId;

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
