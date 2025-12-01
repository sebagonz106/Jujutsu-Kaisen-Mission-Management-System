using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.IService;


namespace GestionDeMisiones.Service
{
    public class MaldicionService : IMaldicionService
    {
        private readonly IMaldicionRepository _repository;

        public MaldicionService(IMaldicionRepository repository)
        {
            _repository = repository;
        }

        public Task<List<Maldicion>> GetAllAsync() => _repository.GetAllAsync();

        public async Task<(IEnumerable<Maldicion> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit)
        {
            if (limit <= 0) limit = 20;
            if (limit > 100) limit = 100;
            var list = await _repository.GetPagedAsync(cursor, limit);
            var hasMore = list.Count > limit;
            if (hasMore) list.RemoveAt(list.Count - 1);
            int? nextCursor = list.Count > 0 ? list.Last().Id : null;
            return (list, nextCursor, hasMore);
        }

        public Task<Maldicion?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);

        public async Task<Maldicion?> CreateAsync(Maldicion maldicion)
        {
            maldicion.Id = 0;
            return await _repository.AddAsync(maldicion);
        }

        public Task<bool> UpdateAsync(int id, Maldicion maldicion) => _repository.UpdateAsync(id, maldicion);

        public Task<bool> DeleteAsync(int id) => _repository.DeleteAsync(id);
    }
}
