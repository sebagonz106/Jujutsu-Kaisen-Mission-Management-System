using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.IService;


namespace GestionDeMisiones.Service
{
    public class MaldicionService : IMaldicionService
    {
        private readonly IMaldicionRepository _repository;
        private readonly ISolicitudRepository _solicitudRepository;

        public MaldicionService(IMaldicionRepository repository, ISolicitudRepository solicitudRepository)
        {
            _repository = repository;
            _solicitudRepository = solicitudRepository;
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

        public async Task<Maldicion?> GetByIdAsync(int id)
        {
            var maldicion = await _repository.GetByIdAsync(id);
            
            // Si no existe la maldición pero es solicitada, crear una "desconocida"
            if (maldicion == null)
            {
                try
                {
                    var maldicionDesconocida = new Maldicion
                    {
                        Id = id,
                        Nombre = "Desconocida",
                        FechaYHoraDeAparicion = DateTime.Now,
                        Grado = Maldicion.EGrado.especial,
                        Tipo = Maldicion.ETipo.desconocida,
                        EstadoActual = Maldicion.EEstadoActual.activa,
                        NivelPeligro = Maldicion.ENivelPeligro.alto,
                        UbicacionDeAparicionId = 1 // Ubicación por defecto o desconocida
                    };
                    
                    // Intentar agregar con el ID específico
                    maldicion = await _repository.AddAsync(maldicionDesconocida);
                }
                catch
                {
                    // Si falla la creación, retornar null (el ID ya existe)
                    return null;
                }
            }
            
            return maldicion;
        }

        public async Task<(bool success, string message, dynamic? generatedData)> CreateAsync(Maldicion maldicion)
        {
            try
            {
                maldicion.Id = 0;
                var maldicionCreada = await _repository.AddAsync(maldicion);

                // Crear Solicitud automáticamente
                var solicitud = new Solicitud
                {
                    MaldicionId = maldicionCreada.Id,
                    Estado = EEstadoSolicitud.pendiente
                };
                var solicitudCreada = await _solicitudRepository.AddAsync(solicitud);

                return (true, "Maldición creada. Solicitud generada automáticamente.", new
                {
                    maldicionId = maldicionCreada.Id,
                    solicitudId = solicitudCreada.Id
                });
            }
            catch (Exception ex)
            {
                return (false, $"Error al crear Maldición: {ex.Message}", null);
            }
        }

        public Task<bool> UpdateAsync(int id, Maldicion maldicion) => _repository.UpdateAsync(id, maldicion);

        public Task<bool> DeleteAsync(int id) => _repository.DeleteAsync(id);
    }
}
