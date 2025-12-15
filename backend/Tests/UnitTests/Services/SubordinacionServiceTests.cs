using Moq;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.IService;
using GestionDeMisiones.Service;

namespace GestionDeMisiones.Tests.UnitTests.Services;

public class SubordinacionServiceTests
{
    private readonly Mock<ISubordinacionRepository> _mockSubordinacionRepo;
    private readonly Mock<IHechiceroRepository> _mockHechiceroRepo;
    private readonly SubordinacionService _service;

    public SubordinacionServiceTests()
    {
        _mockSubordinacionRepo = new Mock<ISubordinacionRepository>();
        _mockHechiceroRepo = new Mock<IHechiceroRepository>();
        _service = new SubordinacionService(_mockSubordinacionRepo.Object, _mockHechiceroRepo.Object);
    }

    [Fact]
    public async Task SubordinacionService_GetAllAsync_RetornaTodasSubordinaciones()
    {
        // Arrange
        var subordinaciones = new List<Subordinacion>
        {
            new Subordinacion
            {
                Id = 1,
                MaestroId = 1,
                DiscipuloId = 2,
                TipoRelacion = Subordinacion.ETipoRelacion.Tutoría,
                Activa = true
            }
        };

        _mockSubordinacionRepo.Setup(r => r.GetAllAsync())
                             .ReturnsAsync(subordinaciones);

        // Act
        var resultado = await _service.GetAllAsync();

        // Assert
        Assert.NotNull(resultado);
        Assert.Single(resultado);
        
        var primera = resultado.First();
        Assert.Equal(1, primera.Id);
        Assert.Equal(Subordinacion.ETipoRelacion.Tutoría, primera.TipoRelacion);
        Assert.True(primera.Activa);
    }

    [Fact]
    public async Task SubordinacionService_CrearAsync_ValidacionesCorrectas()
    {
        // Arrange
        var maestro = new Hechicero { Id = 1, Name = "Maestro" };
        var discipulo = new Hechicero { Id = 2, Name = "Discípulo" };
        
        _mockHechiceroRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(maestro);
        _mockHechiceroRepo.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(discipulo);
        _mockSubordinacionRepo.Setup(r => r.ExisteRelacionActivaAsync(1, 2)).ReturnsAsync(false);

        var nuevaSubordinacion = new Subordinacion
        {
            MaestroId = 1,
            DiscipuloId = 2,
            TipoRelacion = Subordinacion.ETipoRelacion.Tutoría
        };

        _mockSubordinacionRepo.Setup(r => r.AddAsync(It.IsAny<Subordinacion>()))
                             .ReturnsAsync((Subordinacion s) =>
                             {
                                 s.Id = 100;
                                 return s;
                             });

        // Act
        var resultado = await _service.CrearAsync(nuevaSubordinacion);

        // Assert
        Assert.NotNull(resultado);
        Assert.Equal(100, resultado.Id);
        Assert.Equal(1, resultado.MaestroId);
        Assert.Equal(2, resultado.DiscipuloId);
        Assert.True(resultado.Activa);
        Assert.Equal(Subordinacion.ETipoRelacion.Tutoría, resultado.TipoRelacion);
        
        _mockHechiceroRepo.Verify(r => r.GetByIdAsync(1), Times.Once);
        _mockHechiceroRepo.Verify(r => r.GetByIdAsync(2), Times.Once);
        _mockSubordinacionRepo.Verify(r => r.ExisteRelacionActivaAsync(1, 2), Times.Once);
    }

    [Fact]
    public async Task SubordinacionService_CrearAsync_MismoHechicero_LanzaExcepcion()
    {
        // Arrange
        var subordinacion = new Subordinacion
        {
            MaestroId = 1,
            DiscipuloId = 1, // Mismo ID
            TipoRelacion = Subordinacion.ETipoRelacion.Tutoría
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => 
            _service.CrearAsync(subordinacion)
        );
    }

    [Fact]
    public async Task SubordinacionService_CrearAsync_HechiceroNoExiste_LanzaExcepcion()
    {
        // Arrange
        _mockHechiceroRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((Hechicero?)null);
        
        var subordinacion = new Subordinacion
        {
            MaestroId = 1,
            DiscipuloId = 2,
            TipoRelacion = Subordinacion.ETipoRelacion.Tutoría
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => 
            _service.CrearAsync(subordinacion)
        );
    }

    [Fact]
    public async Task SubordinacionService_CrearAsync_RelacionYaExiste_LanzaExcepcion()
    {
        // Arrange
        var maestro = new Hechicero { Id = 1 };
        var discipulo = new Hechicero { Id = 2 };
        
        _mockHechiceroRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(maestro);
        _mockHechiceroRepo.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(discipulo);
        _mockSubordinacionRepo.Setup(r => r.ExisteRelacionActivaAsync(1, 2)).ReturnsAsync(true);
        
        var subordinacion = new Subordinacion
        {
            MaestroId = 1,
            DiscipuloId = 2,
            TipoRelacion = Subordinacion.ETipoRelacion.Tutoría
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => 
            _service.CrearAsync(subordinacion)
        );
    }
}