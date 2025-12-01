using GestionDeMisiones.Models;

namespace GestionDeMisiones.IRepository;

/// <summary>
/// Interfaz del repositorio para gestionar entradas de auditoría.
/// </summary>
public interface IAuditRepository
{
    /// <summary>
    /// Obtiene las entradas de auditoría más recientes.
    /// </summary>
    /// <param name="limit">Cantidad máxima de entradas a retornar.</param>
    /// <param name="offset">Desplazamiento para paginación.</param>
    /// <returns>Lista de entradas de auditoría ordenadas por fecha descendente.</returns>
    Task<IEnumerable<AuditEntry>> GetRecentAsync(int limit = 20, int offset = 0);

    /// <summary>
    /// Obtiene una entrada de auditoría por su ID.
    /// </summary>
    /// <param name="id">ID de la entrada.</param>
    /// <returns>La entrada de auditoría o null si no existe.</returns>
    Task<AuditEntry?> GetByIdAsync(int id);

    /// <summary>
    /// Obtiene entradas de auditoría filtradas por entidad.
    /// </summary>
    /// <param name="entity">Tipo de entidad (hechicero, maldicion, mision, etc.).</param>
    /// <param name="limit">Cantidad máxima de entradas.</param>
    /// <returns>Lista de entradas para esa entidad.</returns>
    Task<IEnumerable<AuditEntry>> GetByEntityAsync(string entity, int limit = 20);

    /// <summary>
    /// Crea una nueva entrada de auditoría.
    /// </summary>
    /// <param name="entry">Entrada a crear.</param>
    /// <returns>La entrada creada con su ID asignado.</returns>
    Task<AuditEntry> CreateAsync(AuditEntry entry);

    /// <summary>
    /// Obtiene el total de entradas de auditoría.
    /// </summary>
    /// <returns>Número total de entradas.</returns>
    Task<int> GetTotalCountAsync();
}
