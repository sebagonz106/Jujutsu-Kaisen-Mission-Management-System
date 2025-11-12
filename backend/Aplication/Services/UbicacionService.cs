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

        public async Task<(IEnumerable<Ubicacion> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit)
        {
            if (limit <= 0) limit = 20;
            if (limit > 100) limit = 100;
            var list = await _repository.GetPagedAsync(cursor, limit);
            var hasMore = list.Count > limit;
            if (hasMore) list.RemoveAt(list.Count - 1);
            int? nextCursor = list.Count > 0 ? list.Last().Id : null;
            return (list, nextCursor, hasMore);
        }
        public Task<Ubicacion?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);
        public Task<Ubicacion> AddAsync(Ubicacion ubicacion) => _repository.AddAsync(ubicacion);
        public Task<bool> DeleteAsync(int id) => _repository.DeleteAsync(id);
        public Task<Ubicacion?> UpdateAsync(int id, Ubicacion ubicacion) => _repository.UpdateAsync(id, ubicacion);
    }
}
