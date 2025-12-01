using GestionDeMisiones.Data;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionDeMisiones.Repositories;

/// <summary>
/// Implementación del repositorio de auditoría usando Entity Framework Core.
/// </summary>
public class AuditRepository : IAuditRepository
{
    private readonly AppDbContext _context;

    public AuditRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AuditEntry>> GetRecentAsync(int limit = 20, int offset = 0)
    {
        return await _context.AuditEntries
            .OrderByDescending(a => a.Timestamp)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<AuditEntry?> GetByIdAsync(int id)
    {
        return await _context.AuditEntries.FindAsync(id);
    }

    public async Task<IEnumerable<AuditEntry>> GetByEntityAsync(string entity, int limit = 20)
    {
        return await _context.AuditEntries
            .Where(a => a.Entity.ToLower() == entity.ToLower())
            .OrderByDescending(a => a.Timestamp)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<AuditEntry> CreateAsync(AuditEntry entry)
    {
        entry.Timestamp = DateTime.UtcNow;
        _context.AuditEntries.Add(entry);
        await _context.SaveChangesAsync();
        return entry;
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _context.AuditEntries.CountAsync();
    }
}
