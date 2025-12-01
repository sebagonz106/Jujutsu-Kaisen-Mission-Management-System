using GestionDeMisiones.Models;

namespace GestionDeMisiones.IServices;

/// <summary>
/// Interfaz del servicio de auditoría.
/// </summary>
public interface IAuditService
{
    /// <summary>
    /// Obtiene las entradas de auditoría más recientes.
    /// </summary>
    /// <param name="limit">Cantidad máxima de entradas a retornar.</param>
    /// <param name="offset">Desplazamiento para paginación.</param>
    /// <returns>Lista de entradas de auditoría.</returns>
    Task<IEnumerable<AuditEntry>> GetRecentEntriesAsync(int limit = 20, int offset = 0);

    /// <summary>
    /// Obtiene una entrada de auditoría por su ID.
    /// </summary>
    /// <param name="id">ID de la entrada.</param>
    /// <returns>La entrada de auditoría o null.</returns>
    Task<AuditEntry?> GetEntryByIdAsync(int id);

    /// <summary>
    /// Obtiene entradas filtradas por tipo de entidad.
    /// </summary>
    /// <param name="entity">Tipo de entidad.</param>
    /// <param name="limit">Cantidad máxima.</param>
    /// <returns>Lista de entradas.</returns>
    Task<IEnumerable<AuditEntry>> GetEntriesByEntityAsync(string entity, int limit = 20);

    /// <summary>
    /// Registra una nueva acción en el log de auditoría.
    /// </summary>
    /// <param name="entity">Tipo de entidad afectada.</param>
    /// <param name="action">Acción realizada (create, update, delete).</param>
    /// <param name="entityId">ID de la entidad afectada.</param>
    /// <param name="actorRole">Rol del actor.</param>
    /// <param name="actorRank">Rango del actor (opcional).</param>
    /// <param name="actorName">Nombre del actor (opcional).</param>
    /// <param name="summary">Resumen de la acción (opcional).</param>
    /// <returns>La entrada de auditoría creada.</returns>
    Task<AuditEntry> LogActionAsync(
        string entity,
        string action,
        int entityId,
        string actorRole,
        string? actorRank = null,
        string? actorName = null,
        string? summary = null);

    /// <summary>
    /// Obtiene el total de entradas.
    /// </summary>
    /// <returns>Número total.</returns>
    Task<int> GetTotalCountAsync();
}
