using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;

namespace GestionDeMisiones.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UbicacionController : ControllerBase
    {
        private readonly IUbicacionService _service;

        public UbicacionController(IUbicacionService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ubicacion>>> GetAll()
        {
            var ubicaciones = await _service.GetAllAsync();
            return Ok(ubicaciones);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Ubicacion>> GetById(int id)
        {
            var ubicacion = await _service.GetByIdAsync(id);
            if (ubicacion == null) return NotFound("La ubicación no existe.");
            return Ok(ubicacion);
        }

        [HttpPost]
        public async Task<ActionResult<Ubicacion>> Create([FromBody] Ubicacion ubicacion)
        {
            if (!ModelState.IsValid)
                return BadRequest("Ubicación inválida.");

            var nueva = await _service.AddAsync(ubicacion);
            return CreatedAtAction(nameof(GetById), new { id = nueva.Id }, nueva);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var eliminado = await _service.DeleteAsync(id);
            if (!eliminado) return NotFound("No se encontró la ubicación.");
            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Ubicacion ubicacion)
        {
            var actualizado = await _service.UpdateAsync(id, ubicacion);
            if (actualizado == null) return NotFound("No se encontró la ubicación.");
            return Ok(actualizado);
        }
    }
}
