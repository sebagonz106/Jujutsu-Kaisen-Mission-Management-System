namespace GestionDeMisiones.Tests.UnitTests.Repositories;

public class MisionesEnRangoRepositoryTests : IDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly MisionesEnRangoRepository _repository;

    public MisionesEnRangoRepositoryTests()
    {
        _dbContext = TestDatabaseFactory.CreateContext();
        _repository = new MisionesEnRangoRepository(_dbContext);
    }

    public void Dispose()
    {
        _dbContext.Dispose();
    }

    [Fact]
    public async Task MisionesEnRangoRepository_GetMisionesCompletadasPorRango_RetornaCorrectamente()
    {
        // Arrange
        var ahora = DateTime.Now;
        var ubicacion = new Ubicacion { Id = 1, Nombre = "Shibuya" };
        
        // Crear hechiceros
        var hechicero1 = new Hechicero { Id = 1, Name = "Satoru Gojo" };
        var hechicero2 = new Hechicero { Id = 2, Name = "Yuji Itadori" };
        
        // Crear técnica maldita
        var tecnica = new TecnicaMaldita { Id = 1, Nombre = "Límite Infinito" };
        
        // Crear misiones
        var mision1 = new Mision
        {
            Id = 1,
            EventosOcurridos = "Misión exitosa",
            Estado = Mision.EEstadoMision.CompletadaConExito,
            NivelUrgencia = Mision.ENivelUrgencia.Urgente,
            FechaYHoraDeInicio = ahora.AddDays(-10),
            FechaYHoraDeFin = ahora.AddDays(-9),
            UbicacionId = 1,
            Ubicacion = ubicacion
        };
        
        var mision2 = new Mision
        {
            Id = 2,
            EventosOcurridos = "Misión exitosa fuera de rango",
            Estado = Mision.EEstadoMision.CompletadaConExito,
            NivelUrgencia = Mision.ENivelUrgencia.Planificada,
            FechaYHoraDeInicio = ahora.AddDays(-20),
            FechaYHoraDeFin = ahora.AddDays(-19),
            UbicacionId = 1,
            Ubicacion = ubicacion
        };
        
        var mision3 = new Mision
        {
            Id = 3,
            EventosOcurridos = "Misión en progreso",
            Estado = Mision.EEstadoMision.EnProgreso,
            NivelUrgencia = Mision.ENivelUrgencia.Urgente,
            FechaYHoraDeInicio = ahora.AddDays(-5),
            FechaYHoraDeFin = null,
            UbicacionId = 1,
            Ubicacion = ubicacion
        };
        
        // Crear relaciones
        var hechiceroEnMision1 = new HechiceroEnMision { HechiceroId = 1, MisionId = 1, Hechicero = hechicero1, Mision = mision1 };
        var hechiceroEnMision2 = new HechiceroEnMision { HechiceroId = 2, MisionId = 1, Hechicero = hechicero2, Mision = mision1 };
        
        var tecnicaAplicada = new TecnicaMalditaAplicada { MisionId = 1, TecnicaMalditaId = 1, TecnicaMaldita = tecnica };
        
        // Agregar al contexto
        await _dbContext.Ubicaciones.AddAsync(ubicacion);
        await _dbContext.Hechiceros.AddRangeAsync(hechicero1, hechicero2);
        await _dbContext.TecnicasMalditas.AddAsync(tecnica);
        await _dbContext.Misiones.AddRangeAsync(mision1, mision2, mision3);
        await _dbContext.HechiceroEnMision.AddRangeAsync(hechiceroEnMision1, hechiceroEnMision2);
        await _dbContext.TecnicaMalditaAplicada.AddAsync(tecnicaAplicada);
        
        await _dbContext.SaveChangesAsync();
        
        // Act
        var desde = ahora.AddDays(-15);
        var hasta = ahora.AddDays(-5);
        var resultado = await _repository.GetMisionesCompletadasPorRango(desde, hasta);
        
        // Assert
        Assert.NotNull(resultado);
        var lista = resultado.ToList();
        
        // Solo debe retornar la misión 1 (exitosa y dentro del rango)
        Assert.Single(lista);
        
        var misionResultado = lista[0];
        Assert.Equal(1, misionResultado.MisionId);
        Assert.Equal("Shibuya", misionResultado.Ubicacion);
        Assert.Null(misionResultado.Maldicion); // Según la consulta, puede ser null
        
        // Verificar hechiceros
        Assert.NotNull(misionResultado.Hechiceros);
        Assert.Equal(2, misionResultado.Hechiceros.Count);
        Assert.Contains("Satoru Gojo", misionResultado.Hechiceros);
        Assert.Contains("Yuji Itadori", misionResultado.Hechiceros);
        
        // Verificar técnicas
        Assert.NotNull(misionResultado.Tecnicas);
        Assert.Single(misionResultado.Tecnicas);
        Assert.Contains("Límite Infinito", misionResultado.Tecnicas);
    }
}