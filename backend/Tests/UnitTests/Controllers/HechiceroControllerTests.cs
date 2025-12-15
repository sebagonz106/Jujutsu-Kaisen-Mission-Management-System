using Moq;
using Microsoft.AspNetCore.Mvc;
using GestionDeMisiones.Models;
using GestionDeMisiones.IService;
using GestionDeMisiones.Web.Controllers;

namespace GestionDeMisiones.Tests.UnitTests.Controllers;

public class HechiceroControllerTests
{
    private readonly Mock<IHechiceroService> _mockService;
    private readonly HechiceroController _controller;

    public HechiceroControllerTests()
    {
        _mockService = new Mock<IHechiceroService>();
        _controller = new HechiceroController(_mockService.Object);
    }

    [Fact]
    public async Task HechiceroController_GetHechiceroById_HechiceroExiste_RetornaOK()
    {
        // Arrange
        var hechiceroId = 1;
        var hechiceroEsperado = new Hechicero
        {
            Id = 1,
            Name = "Satoru Gojo",
            Grado = Hechicero.EGrados.especial,
            Experiencia = 15
        };

        _mockService.Setup(s => s.GetByIdAsync(hechiceroId))
                   .ReturnsAsync(hechiceroEsperado);

        // Act
        var resultado = await _controller.GetHechiceroById(hechiceroId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(resultado.Result);
        var hechiceroRetornado = Assert.IsType<Hechicero>(okResult.Value);
        
        Assert.Equal(hechiceroId, hechiceroRetornado.Id);
        Assert.Equal("Satoru Gojo", hechiceroRetornado.Name);
        Assert.Equal(Hechicero.EGrados.especial, hechiceroRetornado.Grado);
        
        _mockService.Verify(s => s.GetByIdAsync(hechiceroId), Times.Once);
    }

    [Fact]
    public async Task HechiceroController_GetHechiceroById_HechiceroNoExiste_RetornaNotFound()
    {
        // Arrange
        var hechiceroId = 999;
        _mockService.Setup(s => s.GetByIdAsync(hechiceroId))
                   .ReturnsAsync((Hechicero?)null);

        // Act
        var resultado = await _controller.GetHechiceroById(hechiceroId);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(resultado.Result);
        Assert.Equal("El hechicero que buscas no existe", notFoundResult.Value);
        
        _mockService.Verify(s => s.GetByIdAsync(hechiceroId), Times.Once);
    }

    [Fact]
    public async Task HechiceroController_GetAllHechicero_RetornaLista()
    {
        // Arrange
        var hechiceros = new List<Hechicero>
        {
            new Hechicero { Id = 1, Name = "Satoru Gojo" },
            new Hechicero { Id = 2, Name = "Nanami Kento" }
        };

        _mockService.Setup(s => s.GetAllAsync())
                   .ReturnsAsync(hechiceros);

        // Act
        var resultado = await _controller.GetAllHechicero();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(resultado.Result);
        var listaRetornada = Assert.IsType<List<Hechicero>>(okResult.Value);
        
        Assert.Equal(2, listaRetornada.Count);
        Assert.Contains(listaRetornada, h => h.Name == "Satoru Gojo");
        Assert.Contains(listaRetornada, h => h.Name == "Nanami Kento");
    }

    [Fact]
    public async Task HechiceroController_NewHechicero_DatosInvalidos_RetornaBadRequest()
    {
        // Arrange
        _controller.ModelState.AddModelError("Name", "Required");
        var hechicero = new Hechicero { Id = 1 };

        // Act
        var resultado = await _controller.NewHechicero(hechicero);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(resultado.Result);
        Assert.Equal("Envíe un hechicero válido", badRequestResult.Value);
        
        _mockService.Verify(s => s.CreateAsync(It.IsAny<Hechicero>()), Times.Never);
    }

    [Fact]
    public async Task HechiceroController_NewHechicero_DatosValidos_CreaYRetornaCreated()
    {
        // Arrange
        var nuevoHechicero = new Hechicero
        {
            Name = "Nuevo Hechicero",
            Grado = Hechicero.EGrados.medio,
            Experiencia = 5
        };

        var hechiceroCreado = new Hechicero
        {
            Id = 100,
            Name = "Nuevo Hechicero",
            Grado = Hechicero.EGrados.medio,
            Experiencia = 5
        };

        _mockService.Setup(s => s.CreateAsync(It.IsAny<Hechicero>()))
                   .ReturnsAsync(hechiceroCreado);

        // Act
        var resultado = await _controller.NewHechicero(nuevoHechicero);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(resultado.Result);
        Assert.Equal(nameof(HechiceroController.GetHechiceroById), createdResult.ActionName);
        Assert.Equal(100, createdResult.RouteValues?["id"]);
        
        var hechiceroRetornado = Assert.IsType<Hechicero>(createdResult.Value);
        Assert.Equal(100, hechiceroRetornado.Id);
        Assert.Equal("Nuevo Hechicero", hechiceroRetornado.Name);
        
        _mockService.Verify(s => s.CreateAsync(It.IsAny<Hechicero>()), Times.Once);
    }

    [Fact]
    public async Task HechiceroController_NewHechicero_ServiceLanzaExcepcion_RetornaBadRequest()
    {
        // Arrange
        var nuevoHechicero = new Hechicero
        {
            Name = "Hechicero Inválido",
            Grado = Hechicero.EGrados.medio
        };

        _mockService.Setup(s => s.CreateAsync(It.IsAny<Hechicero>()))
                   .ThrowsAsync(new ArgumentException("Grado inválido"));

        // Act
        var resultado = await _controller.NewHechicero(nuevoHechicero);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(resultado.Result);
        Assert.Equal("Grado inválido", badRequestResult.Value);
    }
}