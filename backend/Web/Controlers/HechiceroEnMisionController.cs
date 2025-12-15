using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.IService;
using GestionDeMisiones.Models;


namespace GestionDeMisiones.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HechiceroEnMisionController : ControllerBase
    {
        private readonly IHechiceroEnMisionService _service;

        public HechiceroEnMisionController(IHechiceroEnMisionService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<HechiceroEnMision>>> GetAll()
        {
            var items = await _service.GetAllAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HechiceroEnMision>> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null)
                return NotFound("El hechicero en mision no existe");
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<HechiceroEnMision>> Create([FromBody] HechiceroEnMision hechiceroEnMision)
        {
            if (!ModelState.IsValid)
                return BadRequest("Hechicero en mision no válido");

            var created = await _service.CreateAsync(hechiceroEnMision);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] HechiceroEnMision hechiceroEnMision)
        {
            if (!ModelState.IsValid)
                return BadRequest("Hechicero encargado no válido");

            var success = await _service.UpdateAsync(id, hechiceroEnMision);
            if (!success)
                return NotFound("El hechicero encargado no existe");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
                return NotFound("El hechicero hechicero en mision no existe");

            return NoContent();
        }
    }
}
