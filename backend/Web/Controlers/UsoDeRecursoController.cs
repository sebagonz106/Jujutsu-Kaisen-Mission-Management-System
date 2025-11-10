using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;


namespace GestionDeMisiones.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsoDeRecursoController : ControllerBase
    {
        private readonly IUsoDeRecursoService _service;

        public UsoDeRecursoController(IUsoDeRecursoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UsoDeRecurso>>> GetAll()
        {
            var usos = await _service.GetAllAsync();
            return Ok(usos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UsoDeRecurso>> GetById(int id)
        {
            var uso = await _service.GetByIdAsync(id);
            if (uso == null)
                return NotFound("El uso de recurso dado no existe");

            return Ok(uso);
        }

        [HttpPost]
        public async Task<ActionResult<UsoDeRecurso>> Post([FromBody] UsoDeRecurso usoDeRecurso)
        {
            if (!ModelState.IsValid)
                return BadRequest("El uso de recurso dado no cumple el formato");

            try
            {
                var nuevo = await _service.AddAsync(usoDeRecurso);
                return CreatedAtAction(nameof(GetById), new { id = nuevo.Id }, nuevo);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var eliminado = await _service.DeleteAsync(id);
            if (!eliminado)
                return NotFound("El uso de recurso dado no existe");

            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UsoDeRecurso>> Put(int id, [FromBody] UsoDeRecurso usoDeRecurso)
        {
            if (!ModelState.IsValid)
                return BadRequest("El uso de recurso dado no cumple el formato");

            try
            {
                var actualizado = await _service.UpdateAsync(id, usoDeRecurso);
                if (actualizado == null)
                    return NotFound("El uso de recurso a modificar no existe");

                return Ok(actualizado);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }
    }
}
