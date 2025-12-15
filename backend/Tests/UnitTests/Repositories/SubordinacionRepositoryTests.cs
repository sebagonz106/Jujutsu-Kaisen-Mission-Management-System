namespace GestionDeMisiones.Tests.UnitTests.Repositories;

public class SubordinacionRepositoryTests : IDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly SubordinacionRepository _repository;

    public SubordinacionRepositoryTests()
    {
        _dbContext = TestDatabaseFactory.CreateContext();
        _repository = new SubordinacionRepository(_dbContext);
    }

    public void Dispose()
    {
        _dbContext.Dispose();
    }

    [Fact]
    public async Task SubordinacionRepository_AddAsync_CreaSubordinacionCorrectamente()
    {
        // Arrange
        var maestro = new Hechicero { Id = 1, Name = "Satoru Gojo" };
        var discipulo = new Hechicero { Id = 2, Name = "Yuji Itadori" };
        
        await _dbContext.Hechiceros.AddRangeAsync(maestro, discipulo);
        await _dbContext.SaveChangesAsync();
        
        var subordinacion = new Subordinacion
        {
            MaestroId = 1,
            DiscipuloId = 2,
            TipoRelacion = Subordinacion.ETipoRelacion.Tutoría,
            Activa = true,
            FechaInicio = DateTime.UtcNow
        };
        
        // Act
        var resultado = await _repository.AddAsync(subordinacion);
        
        // Assert
        Assert.NotNull(resultado);
        Assert.True(resultado.Id > 0); // Debería tener un ID asignado
        Assert.Equal(1, resultado.MaestroId);
        Assert.Equal(2, resultado.DiscipuloId);
        Assert.True(resultado.Activa);
        Assert.Equal(Subordinacion.ETipoRelacion.Tutoría, resultado.TipoRelacion);
    }
    
    [Fact]
    public async Task SubordinacionRepository_GetByIdAsync_RetornaConRelaciones()
    {
        // Arrange
        var maestro = new Hechicero { Id = 10, Name = "Maestro" };
        var discipulo = new Hechicero { Id = 11, Name = "Discípulo" };
        
        await _dbContext.Hechiceros.AddRangeAsync(maestro, discipulo);
        await _dbContext.SaveChangesAsync();
        
        var subordinacion = new Subordinacion
        {
            MaestroId = 10,
            DiscipuloId = 11,
            TipoRelacion = Subordinacion.ETipoRelacion.Tutoría,
            Activa = true,
            FechaInicio = DateTime.UtcNow
        };
        
        await _repository.AddAsync(subordinacion);
        
        // Act
        var resultado = await _repository.GetByIdAsync(subordinacion.Id);
        
        // Assert
        Assert.NotNull(resultado);
        Assert.NotNull(resultado.Maestro);
        Assert.Equal("Maestro", resultado.Maestro.Name);
        Assert.NotNull(resultado.Discipulo);
        Assert.Equal("Discípulo", resultado.Discipulo.Name);
    }
    
    [Fact]
    public async Task SubordinacionRepository_ExisteRelacionActivaAsync_RetornaCorrecto()
    {
        // Arrange
        var maestro = new Hechicero { Id = 20, Name = "Maestro" };
        var discipulo = new Hechicero { Id = 21, Name = "Discípulo" };
        
        await _dbContext.Hechiceros.AddRangeAsync(maestro, discipulo);
        await _dbContext.SaveChangesAsync();
        
        var subordinacion = new Subordinacion
        {
            MaestroId = 20,
            DiscipuloId = 21,
            TipoRelacion = Subordinacion.ETipoRelacion.Tutoría,
            Activa = true,
            FechaInicio = DateTime.UtcNow
        };
        
        await _repository.AddAsync(subordinacion);
        
        // Act & Assert
        var existe = await _repository.ExisteRelacionActivaAsync(20, 21);
        Assert.True(existe);
        
        var noExiste = await _repository.ExisteRelacionActivaAsync(21, 20);
        Assert.False(noExiste);
    }
}