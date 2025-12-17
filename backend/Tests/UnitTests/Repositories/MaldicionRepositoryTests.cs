using GestionDeMisiones.Data;
using GestionDeMisiones.Repository;
using GestionDeMisiones.Tests.TestHelpers;
using GestionDeMisiones.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionDeMisiones.Tests.UnitTests.Repositories;

public class MaldicionRepositoryTests : IDisposable
{
    private readonly AppDbContext _dbContext;
    private readonly MaldicionRepository _repository;

    public MaldicionRepositoryTests()
    {
        _dbContext = TestDatabaseFactory.CreateContext();
        _repository = new MaldicionRepository(_dbContext);
    }

    public void Dispose()
    {
        _dbContext.Dispose();
    }

    [Fact]
    public async Task DeleteAsync_RemovesMaldicionAndDependents()
    {
        // Arrange: Crear maldición, solicitud y hechiceroEncargado
        var ubic = TestDataFactory.CrearUbicacion(100, "TestPlace");
        await _dbContext.Ubicaciones.AddAsync(ubic);

        var mald = new Maldicion { Id = 200, Nombre = "ToDelete", UbicacionDeAparicion = ubic };
        await _dbContext.Maldiciones.AddAsync(mald);
        await _dbContext.SaveChangesAsync();

        var solicitud = new Solicitud { Id = 300, MaldicionId = mald.Id, Estado = EEstadoSolicitud.pendiente };
        await _dbContext.Solicitud.AddAsync(solicitud);
        await _dbContext.SaveChangesAsync();

        var hech = TestDataFactory.CrearHechicero(500, "TestHe", Hechicero.EGrados.medio);
        await _dbContext.Hechiceros.AddAsync(hech);
        await _dbContext.SaveChangesAsync();

        var hechEnc = new HechiceroEncargado { Id = 400, HechiceroId = hech.Id, SolicitudId = solicitud.Id, MisionId = 0 };
        await _dbContext.HechiceroEncargado.AddAsync(hechEnc);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _repository.DeleteAsync(mald.Id);

        // Assert
        Assert.True(result);
        Assert.Null(await _dbContext.Maldiciones.FindAsync(mald.Id));
        Assert.Null(await _dbContext.Solicitud.FindAsync(solicitud.Id));
        Assert.Null(await _dbContext.HechiceroEncargado.FindAsync(hechEnc.Id));
    }
}
