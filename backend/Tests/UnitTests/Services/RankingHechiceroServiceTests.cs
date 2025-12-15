using Moq;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.IService;
using GestionDeMisiones.Services;

namespace GestionDeMisiones.Tests.UnitTests.Services;

public class RankingHechiceroServiceTests
{
    private readonly Mock<IRankingHechiceroRepository> _mockRepository;
    private readonly RankingHechiceroService _service;

    public RankingHechiceroServiceTests()
    {
        _mockRepository = new Mock<IRankingHechiceroRepository>();
        _service = new RankingHechiceroService(_mockRepository.Object);
    }

    [Fact]
    public async Task RankingHechiceroService_GetTopHechicerosPorNivelYUbicacion_RetornaRankingCorrecto()
    {
        // Arrange
        var ubicacionId = 1;
        var rankingEsperado = new List<RankingHechicero>
        {
            new RankingHechicero
            {
                NivelMision = "EmergenciaCritica",
                HechiceroId = 1,
                NombreHechicero = "Satoru Gojo",
                TotalMisiones = 10,
                MisionesExitosas = 10,
                PorcentajeExito = 100.0
            },
            new RankingHechicero
            {
                NivelMision = "EmergenciaCritica",
                HechiceroId = 2,
                NombreHechicero = "Nanami Kento",
                TotalMisiones = 15,
                MisionesExitosas = 12,
                PorcentajeExito = 80.0
            },
            new RankingHechicero
            {
                NivelMision = "Urgente",
                HechiceroId = 3,
                NombreHechicero = "Yuji Itadori",
                TotalMisiones = 8,
                MisionesExitosas = 6,
                PorcentajeExito = 75.0
            }
        };

        _mockRepository.Setup(r => r.GetTopHechicerosPorNivelYUbicacion(ubicacionId))
                      .ReturnsAsync(rankingEsperado);

        // Act
        var resultado = await _service.GetTopHechicerosPorNivelYUbicacion(ubicacionId);

        // Assert
        Assert.NotNull(resultado);
        var lista = resultado.ToList();
        Assert.Equal(3, lista.Count);
        
        // Verificar orden (debería estar ordenado por porcentaje descendente)
        var primero = lista[0];
        Assert.Equal("Satoru Gojo", primero.NombreHechicero);
        Assert.Equal(100.0, primero.PorcentajeExito);
        
        _mockRepository.Verify(r => r.GetTopHechicerosPorNivelYUbicacion(ubicacionId), Times.Once);
    }

    [Fact]
    public async Task RankingHechiceroService_GetTopHechicerosPorNivelYUbicacion_SinResultados_RetornaListaVacia()
    {
        // Arrange
        var ubicacionId = 999;
        _mockRepository.Setup(r => r.GetTopHechicerosPorNivelYUbicacion(ubicacionId))
                      .ReturnsAsync(new List<RankingHechicero>());

        // Act
        var resultado = await _service.GetTopHechicerosPorNivelYUbicacion(ubicacionId);

        // Assert
        Assert.NotNull(resultado);
        Assert.Empty(resultado);
    }
}