using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.IService;
using GestionDeMisiones.Models;
using Microsoft.AspNetCore.Authorization;


namespace GestionDeMisiones.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HechiceroEncargadoController : ControllerBase
    {
        private readonly IHechiceroEncargadoService _service;

        public HechiceroEncargadoController(IHechiceroEncargadoService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<HechiceroEncargado>>> GetAll([FromQuery] int? limit, [FromQuery] int? cursor)
        {
            if (limit.HasValue || cursor.HasValue)
            {
                var (pagedItems, nextCursor, hasMore) = await _service.GetPagedAsync(cursor, limit ?? 20);
                return Ok(new { items = pagedItems, nextCursor, hasMore });
            }
            var items = await _service.GetAllAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<HechiceroEncargado>> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null)
                return NotFound("El hechicero encargado no existe");
            return Ok(item);
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<HechiceroEncargado>> Create([FromBody] HechiceroEncargado hechiceroEncargado)
        {
            if (!ModelState.IsValid)
                return BadRequest("Hechicero encargado no válido");

            var created = await _service.CreateAsync(hechiceroEncargado);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromBody] HechiceroEncargado hechiceroEncargado)
        {
            if (!ModelState.IsValid)
                return BadRequest("Hechicero encargado no válido");

            var success = await _service.UpdateAsync(id, hechiceroEncargado);
            if (!success)
                return NotFound("El hechicero encargado no existe");

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
                return NotFound("El hechicero encargado no existe");

            return NoContent();
        }
    }
}
