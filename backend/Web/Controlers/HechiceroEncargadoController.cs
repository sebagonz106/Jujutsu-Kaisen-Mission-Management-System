using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.IService;
using GestionDeMisiones.Models;


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
        public async Task<ActionResult<IEnumerable<HechiceroEncargado>>> GetAll()
        {
            var items = await _service.GetAllAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HechiceroEncargado>> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null)
                return NotFound("El hechicero encargado no existe");
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<HechiceroEncargado>> Create([FromBody] HechiceroEncargado hechiceroEncargado)
        {
            if (!ModelState.IsValid)
                return BadRequest("Hechicero encargado no válido");

            var created = await _service.CreateAsync(hechiceroEncargado);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
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
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
                return NotFound("El hechicero encargado no existe");

            return NoContent();
        }
    }
}
