using GestionDeMisiones.Models;
using GestionDeMisiones.Web.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GestionDeMisiones.IService
{
    public interface IMisionService
    {
        Task<IEnumerable<Mision>> GetAllAsync();
        Task<(IEnumerable<Mision> items, int? nextCursor, bool hasMore)> GetPagedAsync(int? cursor, int limit);
        Task<Mision?> GetByIdAsync(int id);
        Task<Mision> CreateAsync(Mision mision);
        Task<(bool success, string message, dynamic? generatedData)> UpdateAsync(int id, MisionUpdateRequest request);
        Task<bool> DeleteAsync(int id);
    }
}