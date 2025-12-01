using GestionDeMisiones.IRepository;
using GestionDeMisiones.IServices;
using GestionDeMisiones.Models;

namespace GestionDeMisiones.Services;

/// <summary>
/// Implementación del servicio de auditoría.
/// </summary>
public class AuditService : IAuditService
{
    private readonly IAuditRepository _auditRepository;

    public AuditService(IAuditRepository auditRepository)
    {
        _auditRepository = auditRepository;
    }

    public async Task<IEnumerable<AuditEntry>> GetRecentEntriesAsync(int limit = 20, int offset = 0)
    {
        return await _auditRepository.GetRecentAsync(limit, offset);
    }

    public async Task<AuditEntry?> GetEntryByIdAsync(int id)
    {
        return await _auditRepository.GetByIdAsync(id);
    }

    public async Task<IEnumerable<AuditEntry>> GetEntriesByEntityAsync(string entity, int limit = 20)
    {
        return await _auditRepository.GetByEntityAsync(entity, limit);
    }

    public async Task<AuditEntry> LogActionAsync(
        string entity,
        string action,
        int entityId,
        string actorRole,
        string? actorRank = null,
        string? actorName = null,
        string? summary = null)
    {
        var entry = new AuditEntry
        {
            Entity = entity,
            Action = action,
            EntityId = entityId,
            ActorRole = actorRole,
            ActorRank = actorRank,
            ActorName = actorName,
            Summary = summary,
            Timestamp = DateTime.UtcNow
        };

        return await _auditRepository.CreateAsync(entry);
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _auditRepository.GetTotalCountAsync();
    }
}
