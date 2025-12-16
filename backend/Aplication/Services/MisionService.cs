using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IRepository;

namespace GestionDeMisiones.Service;

using GestionDeMisiones.Web.DTOs;
using GestionDeMisiones.IRepository;

public class MisionService : IMisionService
    {
        private readonly IMisionRepository _misionRepo;
        private readonly IUbicacionRepository _ubicacionRepo;
        private readonly ISolicitudRepository _solicitudRepo;
        private readonly IHechiceroEnMisionRepository _hechiceroEnMisionRepo;
        private readonly IHechiceroEncargadoRepository _hechiceroEncargadoRepo;
        private readonly IMaldicionRepository _maldicionRepo;

        public MisionService(
            IMisionRepository misionRepo,
            IUbicacionRepository ubicacionRepo,
            ISolicitudRepository solicitudRepo,
            IHechiceroEnMisionRepository hechiceroEnMisionRepo,
            IHechiceroEncargadoRepository hechiceroEncargadoRepo,
            IMaldicionRepository maldicionRepo)
        {
            _misionRepo = misionRepo;
            _ubicacionRepo = ubicacionRepo;
            _solicitudRepo = solicitudRepo;
            _hechiceroEnMisionRepo = hechiceroEnMisionRepo;
            _hechiceroEncargadoRepo = hechiceroEncargadoRepo;
            _maldicionRepo = maldicionRepo;
        }    
        public async Task<IEnumerable<Mision>> GetAllAsync()
        => await _misionRepo.GetAllAsync();

    public async Task<(IEnumerable<Mision> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit)
    {
        if (limit <= 0) limit = 20;
        if (limit > 100) limit = 100;
        var list = await _misionRepo.GetPagedAsync(cursor, limit);
        var hasMore = list.Count > limit;
        if (hasMore) list.RemoveAt(list.Count - 1); // remove extra
        int? nextCursor = list.Count > 0 ? list.Last().Id : null;
        return (list, nextCursor, hasMore);
    }

    public async Task<Mision?> GetByIdAsync(int id)
        => await _misionRepo.GetByIdAsync(id);

    public async Task<Mision> CreateAsync(Mision mision)
    {
        // Validaciones de negocio
        if (mision.FechaYHoraDeFin.HasValue && 
            mision.FechaYHoraDeFin <= mision.FechaYHoraDeInicio)
            throw new ArgumentException("La fecha de fin debe ser posterior a la de inicio");

        // Validar que la ubicación existe usando GetByIdAsync
        var ubicacionExistente = await _ubicacionRepo.GetByIdAsync(mision.UbicacionId);
        if (ubicacionExistente == null)
            throw new ArgumentException("La ubicación especificada no existe");

        return await _misionRepo.AddAsync(mision);
    }

    public async Task<(bool success, string message, dynamic? generatedData)> UpdateAsync(int id, MisionUpdateRequest request)
    {
        var mision = await _misionRepo.GetByIdAsync(id);
        if (mision == null)
            return (false, "Misión no encontrada", null);

        // Transición pendiente → en_progreso
        if (mision.Estado == Mision.EEstadoMision.Pendiente && request.Estado == Mision.EEstadoMision.EnProgreso)
        {
            // Validaciones previas
            if (request.UbicacionId == null || request.HechicerosIds == null || request.HechicerosIds.Length == 0)
                return (false, "UbicacionId y HechicerosIds son requeridos para pasar a 'en_progreso'", null);

            var ubicacion = await _ubicacionRepo.GetByIdAsync(request.UbicacionId.Value);
            if (ubicacion == null)
                return (false, "Ubicación especificada no existe", null);

            try
            {
                // Actualizar Misión
                mision.Estado = Mision.EEstadoMision.EnProgreso;
                mision.UbicacionId = request.UbicacionId.Value;
                mision.FechaYHoraDeInicio = mision.FechaYHoraDeInicio == default ? DateTime.Now : mision.FechaYHoraDeInicio;
                await _misionRepo.UpdateAsync(mision);

                // Obtener HechiceroEncargado para encontrar Solicitud asociada
                var hechiceroEncargado = await _hechiceroEncargadoRepo.GetByMisionIdAsync(mision.Id);
                if (hechiceroEncargado != null)
                {
                    // Actualizar Solicitud asociada a 'atendida'
                    var solicitud = await _solicitudRepo.GetByIdAsync(hechiceroEncargado.SolicitudId);
                    if (solicitud != null)
                    {
                        solicitud.Estado = EEstadoSolicitud.atendida;
                        await _solicitudRepo.UpdateAsync(solicitud);

                        // Actualizar estado de Maldición a "en_proceso_de_exorcismo"
                        var maldicion = await _maldicionRepo.GetByIdAsync(solicitud.MaldicionId);
                        if (maldicion != null)
                        {
                            maldicion.EstadoActual = Maldicion.EEstadoActual.en_proceso_de_exorcismo;
                            await _maldicionRepo.UpdateAsync(maldicion.Id, maldicion);
                        }
                    }
                }

                // Crear HechiceroEnMision para cada HechiceroId
                var hemIds = new List<int>();
                foreach (var hechiceroId in request.HechicerosIds)
                {
                    var hem = new HechiceroEnMision
                    {
                        HechiceroId = hechiceroId,
                        MisionId = mision.Id
                    };
                    var creado = await _hechiceroEnMisionRepo.AddAsync(hem);
                    hemIds.Add(creado.Id);
                }

                return (true, 
                    "Misión actualizada a 'en_progreso'. HechiceroEnMision, Solicitud y Maldición (estado: en_proceso_de_exorcismo) generados/actualizados automáticamente.",
                    new { misionId = mision.Id, hechicerosEnMisionIds = hemIds });
            }
            catch (Exception ex)
            {
                return (false, $"Error al actualizar misión a en_progreso: {ex.Message}", null);
            }
        }

        // Transición en_progreso → completada (éxito o fracaso)
        else if (mision.Estado == Mision.EEstadoMision.EnProgreso &&
                 (request.Estado == Mision.EEstadoMision.CompletadaConExito || request.Estado == Mision.EEstadoMision.CompletadaConFracaso))
        {
            try
            {
                mision.Estado = request.Estado;
                mision.FechaYHoraDeFin = DateTime.Now;
                await _misionRepo.UpdateAsync(mision);

                // Obtener HechiceroEncargado para acceder a la Solicitud y su Maldición
                var hechiceroEncargado = await _hechiceroEncargadoRepo.GetByMisionIdAsync(mision.Id);
                
                if (hechiceroEncargado != null)
                {
                    var solicitud = await _solicitudRepo.GetByIdAsync(hechiceroEncargado.SolicitudId);
                    if (solicitud != null)
                    {
                        // Actualizar estado de Maldición basado en resultado
                        var maldicion = await _maldicionRepo.GetByIdAsync(solicitud.MaldicionId);
                        if (maldicion != null)
                        {
                            if (request.Estado == Mision.EEstadoMision.CompletadaConExito)
                            {
                                // Éxito: Maldición pasa a "exorcisada"
                                maldicion.EstadoActual = Maldicion.EEstadoActual.exorcisada;
                            }
                            else if (request.Estado == Mision.EEstadoMision.CompletadaConFracaso)
                            {
                                // Fracaso: Maldición vuelve a "activa"
                                maldicion.EstadoActual = Maldicion.EEstadoActual.activa;
                                // Solicitud vuelve a pendiente para permitir nueva Misión
                                solicitud.Estado = EEstadoSolicitud.pendiente;
                                await _solicitudRepo.UpdateAsync(solicitud);
                            }
                            await _maldicionRepo.UpdateAsync(maldicion.Id, maldicion);
                        }
                    }
                }

                var mensaje = request.Estado == Mision.EEstadoMision.CompletadaConExito ? 
                    "Misión completada con éxito. Maldición marcada como exorcisada" : 
                    "Misión completada con fracaso. Solicitud y Maldición devueltas a estado anterior";
                return (true, mensaje, new { misionId = mision.Id });
            }
            catch (Exception ex)
            {
                return (false, $"Error al completar misión: {ex.Message}", null);
            }
        }

        // Transición en_progreso → cancelada
        else if (mision.Estado == Mision.EEstadoMision.EnProgreso && request.Estado == Mision.EEstadoMision.Cancelada)
        {
            try
            {
                // Cambiar Misión a cancelada (no eliminar, solo cambiar estado)
                mision.Estado = Mision.EEstadoMision.Cancelada;
                mision.FechaYHoraDeFin = DateTime.Now;
                await _misionRepo.UpdateAsync(mision);

                // Devolver Solicitud a 'pendiente' y Maldición a 'activa'
                var hechiceroEncargado = await _hechiceroEncargadoRepo.GetByMisionIdAsync(mision.Id);
                if (hechiceroEncargado != null)
                {
                    var solicitud = await _solicitudRepo.GetByIdAsync(hechiceroEncargado.SolicitudId);
                    if (solicitud != null)
                    {
                        solicitud.Estado = EEstadoSolicitud.pendiente;
                        await _solicitudRepo.UpdateAsync(solicitud);

                        // Devolver Maldición a estado "activa"
                        var maldicion = await _maldicionRepo.GetByIdAsync(solicitud.MaldicionId);
                        if (maldicion != null)
                        {
                            maldicion.EstadoActual = Maldicion.EEstadoActual.activa;
                            await _maldicionRepo.UpdateAsync(maldicion.Id, maldicion);
                        }
                    }
                }

                return (true, "Misión cancelada, Solicitud y Maldición devueltas a 'pendiente' y 'activa'", new { misionId = mision.Id });
            }
            catch (Exception ex)
            {
                return (false, $"Error al cancelar misión: {ex.Message}", null);
            }
        }

        // Transición no permitida
        else
        {
            return (false, 
                $"Transición de estado no permitida: {mision.Estado} → {request.Estado}", 
                null);
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _misionRepo.GetByIdAsync(id);
        if (existing == null)
            return false;

        // Si Misión está en progreso, devolver Solicitud a pendiente
        if (existing.Estado == Mision.EEstadoMision.EnProgreso)
        {
            var hechiceroEncargado = await _hechiceroEncargadoRepo.GetByMisionIdAsync(existing.Id);
            if (hechiceroEncargado != null)
            {
                var solicitud = await _solicitudRepo.GetByIdAsync(hechiceroEncargado.SolicitudId);
                if (solicitud != null)
                {
                    solicitud.Estado = EEstadoSolicitud.pendiente;
                    await _solicitudRepo.UpdateAsync(solicitud);
                }
            }
        }

        await _misionRepo.DeleteAsync(existing);
        return true;
    }
}