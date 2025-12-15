using Moq;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.IService;
using GestionDeMisiones.Service;

namespace GestionDeMisiones.Tests.UnitTests.Services;

public class EstadisticaHechiceroServiceTests
{
    private readonly Mock<IEstadisticasHechiceroRepository> _mockRepository;
    private readonly EstadisticasHechiceroService _service;

    public EstadisticaHechiceroServiceTests()
    {
        _mockRepository = new Mock<IEstadisticasHechiceroRepository>();
        _service = new EstadisticasHechiceroService(_mockRepository.Object);
    }

    [Fact]
    public async Task EstadisticaHechiceroService_GetEfectividadMediosVsAltos_RetornaComparativa()
    {
        // Arrange
        var estadisticasEsperadas = new List<EstadisticaHechicero>
        {
            new EstadisticaHechicero
            {
                HechiceroId = 1,
                Nombre = "Satoru Gojo",
                Grado = "especial",
                PorcentajeEfectividad = 95.5,
                MisionesTotales = 20,
                MisionesExitosas = 19
            },
            new EstadisticaHechicero
            {
                HechiceroId = 2,
                Nombre = "Nanami Kento",
                Grado = "alto",
                PorcentajeEfectividad = 85.0,
                MisionesTotales = 40,
                MisionesExitosas = 34
            }
        };

        _mockRepository.Setup(r => r.GetEfectividadMediosVsAltos())
                      .ReturnsAsync(estadisticasEsperadas);

        // Act
        var resultado = await _service.GetEfectividadMediosVsAltos();

        // Assert
        Assert.NotNull(resultado);
        var lista = resultado.ToList();
        Assert.Equal(2, lista.Count);
        
        var gojo = lista.First();
        Assert.Equal("Satoru Gojo", gojo.Nombre);
        Assert.Equal("especial", gojo.Grado);
        Assert.Equal(95.5, gojo.PorcentajeEfectividad);
        Assert.Equal(20, gojo.MisionesTotales);
        Assert.Equal(19, gojo.MisionesExitosas);
        
        _mockRepository.Verify(r => r.GetEfectividadMediosVsAltos(), Times.Once);
    }

    [Fact]
    public async Task EstadisticaHechiceroService_GetEfectividadMediosVsAltos_SinDatos_RetornaListaVacia()
    {
        // Arrange
        _mockRepository.Setup(r => r.GetEfectividadMediosVsAltos())
                      .ReturnsAsync(new List<EstadisticaHechicero>());

        // Act
        var resultado = await _service.GetEfectividadMediosVsAltos();

        // Assert
        Assert.NotNull(resultado);
        Assert.Empty(resultado);
    }
}