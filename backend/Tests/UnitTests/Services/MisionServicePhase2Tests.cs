using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GestionDeMisiones.Models;
using GestionDeMisiones.Web.DTOs;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.Service;
using Moq;
using Xunit;

namespace GestionDeMisiones.Tests.UnitTests.Services;

public class MisionServicePhase2Tests
{
    private readonly Mock<IMisionRepository> _misionRepoMock = new();
    private readonly Mock<IUbicacionRepository> _ubicacionRepoMock = new();
    private readonly Mock<ISolicitudRepository> _solicitudRepoMock = new();
    private readonly Mock<IHechiceroEnMisionRepository> _hemRepoMock = new();
    private readonly Mock<IHechiceroEncargadoRepository> _heRepoMock = new();
    private readonly Mock<IMaldicionRepository> _maldicionRepoMock = new();
    private readonly MisionService _service;

    public MisionServicePhase2Tests()
    {
        _service = new MisionService(
            _misionRepoMock.Object,
            _ubicacionRepoMock.Object,
            _solicitudRepoMock.Object,
            _hemRepoMock.Object,
            _heRepoMock.Object,
            _maldicionRepoMock.Object
        );
    }

    [Fact]
    public async Task UpdateAsync_PendienteAEnProgreso_CreaHechiceroEnMisionYActualizaSolicitud()
    {
        // Arrange
        var misionId = 1;
        var solicitudId = 10;
        var ubicacionId = 5;
        var hechicerosIds = new[] { 100, 101 };
        var mision = new Mision { Id = misionId, Estado = Mision.EEstadoMision.Pendiente };
        var ubicacion = new Ubicacion { Id = ubicacionId };
        var solicitud = new Solicitud { Id = solicitudId, Estado = EEstadoSolicitud.atendiendose };
        var hemList = new List<HechiceroEnMision>();

        _misionRepoMock.Setup(r => r.GetByIdAsync(misionId)).ReturnsAsync(mision);
        _ubicacionRepoMock.Setup(r => r.GetByIdAsync(ubicacionId)).ReturnsAsync(ubicacion);
        _hemRepoMock.Setup(r => r.GetByMisionIdAsync(misionId)).ReturnsAsync(hemList);
        _solicitudRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync(solicitud);
        _misionRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Mision>())).Returns(Task.CompletedTask);
        _solicitudRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Solicitud>())).Returns(Task.CompletedTask);
        _hemRepoMock.Setup(r => r.AddAsync(It.IsAny<HechiceroEnMision>())).ReturnsAsync((HechiceroEnMision hem) => { hem.Id = new Random().Next(1, 1000); return hem; });

        var request = new MisionUpdateRequest
        {
            Estado = Mision.EEstadoMision.EnProgreso,
            UbicacionId = ubicacionId,
            HechicerosIds = hechicerosIds
        };

        // Act
        var (success, message, generatedData) = await _service.UpdateAsync(misionId, request);

        // Assert
        Assert.True(success);
        Assert.Contains("en_progreso", message);
        Assert.NotNull(generatedData);
        Assert.Equal(misionId, generatedData.misionId);
        Assert.Equal(2, ((IEnumerable<int>)generatedData.hechicerosEnMisionIds).Count());
    }

    [Fact]
    public async Task UpdateAsync_EnProgresoACompletadaExito_Ok()
    {
        // Arrange
        var misionId = 2;
        var mision = new Mision { Id = misionId, Estado = Mision.EEstadoMision.EnProgreso };
        _misionRepoMock.Setup(r => r.GetByIdAsync(misionId)).ReturnsAsync(mision);
        _misionRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Mision>())).Returns(Task.CompletedTask);

        var request = new MisionUpdateRequest
        {
            Estado = Mision.EEstadoMision.CompletadaConExito
        };

        // Act
        var (success, message, generatedData) = await _service.UpdateAsync(misionId, request);

        // Assert
        Assert.True(success);
        Assert.Contains("éxito", message);
        Assert.Equal(misionId, generatedData.misionId);
    }

    [Fact]
    public async Task UpdateAsync_EnProgresoACompletadaFracaso_Ok()
    {
        // Arrange
        var misionId = 3;
        var mision = new Mision { Id = misionId, Estado = Mision.EEstadoMision.EnProgreso };
        _misionRepoMock.Setup(r => r.GetByIdAsync(misionId)).ReturnsAsync(mision);
        _misionRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Mision>())).Returns(Task.CompletedTask);

        var request = new MisionUpdateRequest
        {
            Estado = Mision.EEstadoMision.CompletadaConFracaso
        };

        // Act
        var (success, message, generatedData) = await _service.UpdateAsync(misionId, request);

        // Assert
        Assert.True(success);
        Assert.Contains("fracaso", message);
        Assert.Equal(misionId, generatedData.misionId);
    }

    [Fact]
    public async Task UpdateAsync_EnProgresoACancelada_ActualizaSolicitud()
    {
        // Arrange
        var misionId = 4;
        var solicitudId = 20;
        var mision = new Mision { Id = misionId, Estado = Mision.EEstadoMision.EnProgreso };
        var hemList = new List<HechiceroEnMision> { new HechiceroEnMision { MisionId = misionId } };
        var solicitud = new Solicitud { Id = solicitudId, Estado = EEstadoSolicitud.atendida };
        _misionRepoMock.Setup(r => r.GetByIdAsync(misionId)).ReturnsAsync(mision);
        _hemRepoMock.Setup(r => r.GetByMisionIdAsync(misionId)).ReturnsAsync(hemList);
        _solicitudRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync(solicitud);
        _misionRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Mision>())).Returns(Task.CompletedTask);
        _solicitudRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Solicitud>())).Returns(Task.CompletedTask);

        var request = new MisionUpdateRequest
        {
            Estado = Mision.EEstadoMision.Cancelada
        };

        // Act
        var (success, message, generatedData) = await _service.UpdateAsync(misionId, request);

        // Assert
        Assert.True(success);
        Assert.Contains("cancelada", message);
        Assert.Equal(misionId, generatedData.misionId);
    }

    [Fact]
    public async Task UpdateAsync_PendienteAEnProgreso_FaltaDatos_Error()
    {
        // Arrange
        var misionId = 5;
        var mision = new Mision { Id = misionId, Estado = Mision.EEstadoMision.Pendiente };
        _misionRepoMock.Setup(r => r.GetByIdAsync(misionId)).ReturnsAsync(mision);

        var request = new MisionUpdateRequest
        {
            Estado = Mision.EEstadoMision.EnProgreso,
            UbicacionId = null,
            HechicerosIds = null
        };

        // Act
        var (success, message, generatedData) = await _service.UpdateAsync(misionId, request);

        // Assert
        Assert.False(success);
        Assert.Contains("UbicacionId y HechicerosIds son requeridos", message);
    }
}
