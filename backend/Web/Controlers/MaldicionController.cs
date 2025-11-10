using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;

namespace GestionDeMisiones.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaldicionController : ControllerBase
    {
        private readonly IMaldicionService _service;

        public MaldicionController(IMaldicionService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? limit, [FromQuery] int? cursor)
        {
            if (limit.HasValue || cursor.HasValue)
            {
                var lim = limit ?? 20;
                var (items, nextCursor, hasMore) = await _service.GetPagedAsync(cursor, lim);
                return Ok(new { items, nextCursor, hasMore });
            }
            var maldiciones = await _service.GetAllAsync();
            return Ok(maldiciones);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Maldicion>> GetById(int id)
        {
            var maldicion = await _service.GetByIdAsync(id);
            if (maldicion == null)
                return NotFound("La maldición que buscas no existe.");

            return Ok(maldicion);
        }

        [HttpPost]
        public async Task<ActionResult<Maldicion>> Create([FromBody] Maldicion maldicion)
        {
            if (!ModelState.IsValid)
                return BadRequest("Envíe una maldición válida.");

            var created = await _service.CreateAsync(maldicion);
            return CreatedAtAction(nameof(GetById), new { id = created!.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Maldicion maldicion)
        {
            if (!ModelState.IsValid)
                return BadRequest("Envíe una maldición válida.");

            var updated = await _service.UpdateAsync(id, maldicion);
            if (!updated)
                return NotFound("La maldición que desea editar no existe.");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
                return NotFound("La maldición que desea eliminar no existe.");

            return NoContent();
        }
    }
}
