using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.DTOs;

namespace GestionDeMisiones.Service;

public class SolicitudService : ISolicitudService
{
    private readonly ISolicitudRepository _solicitudRepo;
    private readonly IMaldicionRepository _maldicionRepo;
    private readonly IMisionRepository _misionRepo;
    private readonly IHechiceroEncargadoRepository _hechiceroEncargadoRepo;
    private readonly IHechiceroRepository _hechiceroRepo;

    public SolicitudService(
        ISolicitudRepository solicitudRepo,
        IMaldicionRepository maldicionRepo,
        IMisionRepository misionRepo,
        IHechiceroEncargadoRepository hechiceroEncargadoRepo,
        IHechiceroRepository hechiceroRepo)
    {
        _solicitudRepo = solicitudRepo;
        _maldicionRepo = maldicionRepo;
        _misionRepo = misionRepo;
        _hechiceroEncargadoRepo = hechiceroEncargadoRepo;
        _hechiceroRepo = hechiceroRepo;
    }

    public async Task<IEnumerable<Solicitud>> GetAllAsync()
        => await _solicitudRepo.GetAllAsync();

    public async Task<(IEnumerable<Solicitud> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit)
    {
        if (limit <= 0) limit = 20;
        if (limit > 100) limit = 100;
        var list = await _solicitudRepo.GetPagedAsync(cursor, limit);
        var hasMore = list.Count > limit;
        if (hasMore) list.RemoveAt(list.Count - 1);
        int? nextCursor = list.Count > 0 ? list.Last().Id : null;
        return (list, nextCursor, hasMore);
    }

    public async Task<Solicitud?> GetByIdAsync(int id)
        => await _solicitudRepo.GetByIdAsync(id);

    /// <summary>
    /// Crear Solicitud. Normalmente es llamado internamente desde MaldicionService
    /// para generar la solicitud automáticamente al crear una Maldición.
    /// </summary>
    public async Task<Solicitud> CreateAsync(Solicitud solicitud)
    {
        // Validaciones de negocio
        if (solicitud.MaldicionId <= 0)
            throw new ArgumentException("La maldición es obligatoria");

        // Validar que la maldición existe usando GetByIdAsync
        var maldicionExistente = await _maldicionRepo.GetByIdAsync(solicitud.MaldicionId);
        if (maldicionExistente == null)
            throw new ArgumentException("La maldición especificada no existe");

        if (!Enum.IsDefined(typeof(EEstadoSolicitud), solicitud.Estado))
            throw new ArgumentException("Estado de solicitud no válido");

        return await _solicitudRepo.AddAsync(solicitud);
    }

    /// <summary>
    /// Actualiza una Solicitud con lógica de cascada automática.
    /// - Si cambia a "atendiendose": Crea automáticamente Misión + HechiceroEncargado
    /// - Si cambia de "atendiendose" a "pendiente": Elimina Misión + HechiceroEncargado
    /// </summary>
    public async Task<(bool success, string message, dynamic? generatedData)> UpdateAsync(int id, SolicitudUpdateRequest request)
    {
        var existing = await _solicitudRepo.GetByIdAsync(id);
        if (existing == null)
            return (false, "Solicitud no encontrada", null);

        // Cambio pendiente → atendiendose (dispara creación de Misión + HechiceroEncargado)
        if (existing.Estado == EEstadoSolicitud.pendiente && 
            request.Estado == EEstadoSolicitud.atendiendose)
        {
            // Validaciones previas
            if (!request.HechiceroEncargadoId.HasValue || request.HechiceroEncargadoId.Value <= 0)
                return (false, "Se requiere HechiceroEncargadoId para cambiar a estado 'atendiendose'", null);

            if (!request.NivelUrgencia.HasValue)
                return (false, "Se requiere NivelUrgencia para cambiar a estado 'atendiendose'", null);

            // Validar que el Hechicero existe
            var hechicero = await _hechiceroRepo.GetByIdAsync(request.HechiceroEncargadoId.Value);
            if (hechicero == null)
                return (false, $"El Hechicero con ID {request.HechiceroEncargadoId} no existe", null);

            // Verificar que no existen Misiones ACTIVAS ASOCIADAS A ESTA SOLICITUD
            // Una solicitud puede tener múltiples misiones a través de múltiples HechiceroEncargado
            var hechicerosEncargados = await _hechiceroEncargadoRepo.GetAllBySolicitudIdAsync(id);
            foreach (var he in hechicerosEncargados)
            {
                var misionExistente = await _misionRepo.GetByIdAsync(he.MisionId);
                if (misionExistente != null &&
                    misionExistente.Estado != Mision.EEstadoMision.Cancelada && 
                    misionExistente.Estado != Mision.EEstadoMision.CompletadaConExito && 
                    misionExistente.Estado != Mision.EEstadoMision.CompletadaConFracaso)
                {
                    return (false, $"Ya existe una Misión activa para esta Solicitud", null);
                }
            }

            try
            {
                // Actualizar Solicitud
                existing.Estado = request.Estado;
                await _solicitudRepo.UpdateAsync(existing);

                // Crear Misión automáticamente
                // Usar la ubicación de aparición de la Maldición asociada a la Solicitud
                var maldicion = existing.Maldicion ?? await _maldicionRepo.GetByIdAsync(existing.MaldicionId);
                if (maldicion == null)
                    return (false, "No se encontró la Maldición asociada a la Solicitud", null);

                var mision = new Mision
                {
                    UbicacionId = maldicion.UbicacionDeAparicionId,
                    NivelUrgencia = request.NivelUrgencia.Value,
                    FechaYHoraDeInicio = DateTime.Now,
                    Estado = Mision.EEstadoMision.Pendiente
                };
                var misionCreada = await _misionRepo.AddAsync(mision);

                // Crear HechiceroEncargado automáticamente
                var he = new HechiceroEncargado
                {
                    HechiceroId = request.HechiceroEncargadoId.Value,
                    SolicitudId = existing.Id,
                    MisionId = misionCreada.Id
                };
                var heCreado = await _hechiceroEncargadoRepo.AddAsync(he);

                return (true, 
                    "Solicitud actualizada. Misión y HechiceroEncargado generados automáticamente.",
                    new { misionId = misionCreada.Id, hechiceroEncargadoId = heCreado.Id });
            }
            catch (Exception ex)
            {
                return (false, $"Error al actualizar solicitud: {ex.Message}", null);
            }
        }

        // Cambio atendiendose → pendiente (deshacer - elimina Misión + HechiceroEncargado)
        else if (existing.Estado == EEstadoSolicitud.atendiendose && 
                 request.Estado == EEstadoSolicitud.pendiente)
        {
            try
            {
                // Obtener TODOS los HechiceroEncargado asociados a esta solicitud
                var hechicerosEncargados = await _hechiceroEncargadoRepo.GetAllBySolicitudIdAsync(existing.Id);
                foreach (var he in hechicerosEncargados)
                {
                    // Obtener la Misión asociada
                    var mision = await _misionRepo.GetByIdAsync(he.MisionId);

                    // Solo eliminar la misión y su HechiceroEncargado si la misión está en Pendiente o EnProgreso
                    if (mision != null &&
                        (mision.Estado == Mision.EEstadoMision.Pendiente || mision.Estado == Mision.EEstadoMision.EnProgreso))
                    {
                        await _misionRepo.DeleteAsync(mision);
                        await _hechiceroEncargadoRepo.DeleteAsync(he);
                    }
                    // Si la misión existe pero no está en un estado eliminable, dejamos tanto la misión
                    // como el registro de HechiceroEncargado intactos.
                }

                // Actualizar Solicitud
                existing.Estado = request.Estado;
                await _solicitudRepo.UpdateAsync(existing);

                return (true, "Solicitud devuelta a estado 'pendiente'. Misión y HechiceroEncargado eliminados.", null);
            }
            catch (Exception ex)
            {
                return (false, $"Error al deshacer solicitud: {ex.Message}", null);
            }
        }

        // Cambio dentro de atendiendose: Actualizar HechiceroEncargado y/o NivelUrgencia
        else if (existing.Estado == EEstadoSolicitud.atendiendose && 
                 request.Estado == EEstadoSolicitud.atendiendose)
        {
            try
            {
                var he = await _hechiceroEncargadoRepo.GetBySolicitudIdAsync(existing.Id);
                if (he == null)
                    return (false, "No se encontró HechiceroEncargado asociado a esta Solicitud", null);

                var mision = await _misionRepo.GetByIdAsync(he.MisionId);
                if (mision == null)
                    return (false, "No se encontró Misión asociada a esta Solicitud", null);

                // Cambio de HechiceroEncargado
                if (request.HechiceroEncargadoId.HasValue && request.HechiceroEncargadoId.Value != he.HechiceroId)
                {
                    // Validar que el nuevo Hechicero existe
                    var nuevoHechicero = await _hechiceroRepo.GetByIdAsync(request.HechiceroEncargadoId.Value);
                    if (nuevoHechicero == null)
                        return (false, $"El Hechicero con ID {request.HechiceroEncargadoId} no existe", null);

                    // Contar misiones activas del hechicero actual
                    var todasLasMisiones = await _misionRepo.GetAllAsync();
                    var misionesActivasHechiceroActual = todasLasMisiones
                        .Where(m => m.Estado == Mision.EEstadoMision.EnProgreso || m.Estado == Mision.EEstadoMision.Pendiente)
                        .Join(
                            await _hechiceroEncargadoRepo.GetAllAsync(),
                            m => m.Id,
                            he2 => he2.MisionId,
                            (m, he2) => new { Mision = m, HechiceroEncargado = he2 }
                        )
                        .Where(x => x.HechiceroEncargado.HechiceroId == he.HechiceroId)
                        .ToList();

                    // Caso A: Si el hechicero actual está en múltiples misiones → Crear nuevo HechiceroEncargado
                    if (misionesActivasHechiceroActual.Count > 1)
                    {
                        var nuevoHE = new HechiceroEncargado
                        {
                            HechiceroId = request.HechiceroEncargadoId.Value,
                            SolicitudId = existing.Id,
                            MisionId = mision.Id
                        };
                        var heCreado = await _hechiceroEncargadoRepo.AddAsync(nuevoHE);
                        
                        // Eliminar el anterior
                        await _hechiceroEncargadoRepo.DeleteAsync(he);

                        return (true, 
                            $"HechiceroEncargado actualizado (nuevo creado). Hechicero anterior removido de esta misión.",
                            new { hechiceroEncargadoId = heCreado.Id });
                    }
                    // Caso B: Si está en una sola misión → Actualizar ID solamente
                    else
                    {
                        he.HechiceroId = request.HechiceroEncargadoId.Value;
                        await _hechiceroEncargadoRepo.UpdateAsync(he);
                        
                        return (true, 
                            "HechiceroEncargado actualizado.",
                            new { hechiceroEncargadoId = he.Id });
                    }
                }

                // Cambio de NivelUrgencia
                if (request.NivelUrgencia.HasValue && request.NivelUrgencia.Value != mision.NivelUrgencia)
                {
                    mision.NivelUrgencia = request.NivelUrgencia.Value;
                    await _misionRepo.UpdateAsync(mision);
                    
                    return (true, 
                        "NivelUrgencia de la Misión actualizado.",
                        new { nivelUrgencia = mision.NivelUrgencia });
                }

                // Si no hay cambios solicitados
                return (true, "Solicitud ya está en estado 'atendiendose'. No hay cambios que aplicar.", null);
            }
            catch (Exception ex)
            {
                return (false, $"Error al actualizar datos en atendiendose: {ex.Message}", null);
            }
        }

        // Cambio atendiendose → atendida (sin cambios adicionales)
        else if (existing.Estado == EEstadoSolicitud.atendiendose && 
                 request.Estado == EEstadoSolicitud.atendida)
        {
            existing.Estado = request.Estado;
            await _solicitudRepo.UpdateAsync(existing);
            return (true, "Solicitud marcada como atendida", null);
        }

        // Transición no permitida
        else
        {
            return (false, 
                $"Transición de estado no permitida: {existing.Estado} → {request.Estado}", 
                null);
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _solicitudRepo.GetByIdAsync(id);
        if (existing == null)
            return false;

        // Si Solicitud tiene Misión en Pendiente o EnProgreso, cambiarla a Cancelada
        var he = await _hechiceroEncargadoRepo.GetBySolicitudIdAsync(id);
        if (he != null)
        {
            var mision = await _misionRepo.GetByIdAsync(he.MisionId);
            if (mision != null && (mision.Estado == Mision.EEstadoMision.Pendiente || mision.Estado == Mision.EEstadoMision.EnProgreso))
            {
                mision.Estado = Mision.EEstadoMision.Cancelada;
                mision.FechaYHoraDeFin = DateTime.Now;
                await _misionRepo.UpdateAsync(mision);
            }
        }

        await _solicitudRepo.DeleteAsync(existing);
        return true;
    }
}