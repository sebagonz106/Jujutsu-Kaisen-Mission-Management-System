using Moq;
using GestionDeMisiones.Tests.TestHelpers;
using GestionDeMisiones.Models;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.IService;
using GestionDeMisiones.Service;
using GestionDeMisiones.DTOs;

namespace GestionDeMisiones.Tests.UnitTests.Services;

/// <summary>
/// Tests para validar Fase 1: Solicitud → Misión + HechiceroEncargado (cascada automática)
/// 
/// Casos de prueba:
/// 1. Transición pendiente → atendiendose crea Misión + HechiceroEncargado
/// 2. Transición atendiendose → pendiente elimina Misión + HechiceroEncargado
/// 3. Transición atendiendose → atendida sin cambios cascada
/// 4. Validaciones: HechiceroId y NivelUrgencia requeridos
/// 5. Manejo de errores: Hechicero no existe, etc.
/// </summary>
public class SolicitudServicePhase1Tests
{
    private readonly Mock<ISolicitudRepository> _solicitudRepoMock;
    private readonly Mock<IMaldicionRepository> _maldicionRepoMock;
    private readonly Mock<IMisionRepository> _misionRepoMock;
    private readonly Mock<IHechiceroEncargadoRepository> _heRepoMock;
    private readonly Mock<IHechiceroRepository> _hechiceroRepoMock;
    private readonly SolicitudService _service;

    public SolicitudServicePhase1Tests()
    {
        _solicitudRepoMock = new Mock<ISolicitudRepository>();
        _maldicionRepoMock = new Mock<IMaldicionRepository>();
        _misionRepoMock = new Mock<IMisionRepository>();
        _heRepoMock = new Mock<IHechiceroEncargadoRepository>();
        _hechiceroRepoMock = new Mock<IHechiceroRepository>();

        _service = new SolicitudService(
            _solicitudRepoMock.Object,
            _maldicionRepoMock.Object,
            _misionRepoMock.Object,
            _heRepoMock.Object,
            _hechiceroRepoMock.Object
        );
    }

    // ============================================================================
    // PRUEBA 1: Transición pendiente → atendiendose crea Misión + HechiceroEncargado
    // ============================================================================
    [Fact]
    public async Task UpdateAsync_PendienteAAtendiendo_CreaMisionYHechiceroEncargado()
    {
        // Arrange
        var solicitudId = 1;
        var hechiceroId = 10;
        var nivelUrgencia = Mision.ENivelUrgencia.Urgente;

        var maldicion = TestDataFactory.CrearMaldicion(id: 5);
        var solicitudExistente = TestDataFactory.CrearSolicitud(
            id: solicitudId,
            maldicion: maldicion,
            estado: EEstadoSolicitud.pendiente
        );

        var hechicero = TestDataFactory.CrearHechicero(id: hechiceroId, nombre: "Yuji Itadori");
        var misionCreada = TestDataFactory.CrearMision(
            id: 1,
            nivelUrgencia: nivelUrgencia,
            estado: Mision.EEstadoMision.Pendiente,
            ubicacion: null
        );
        var heCreado = new HechiceroEncargado
        {
            Id = 1,
            HechiceroId = hechiceroId,
            SolicitudId = solicitudId,
            MisionId = misionCreada.Id
        };

        var request = new SolicitudUpdateRequest
        {
            Estado = EEstadoSolicitud.atendiendose,
            HechiceroEncargadoId = hechiceroId,
            NivelUrgencia = nivelUrgencia
        };

        _solicitudRepoMock.Setup(r => r.GetByIdAsync(solicitudId))
            .ReturnsAsync(solicitudExistente);
        _hechiceroRepoMock.Setup(r => r.GetByIdAsync(hechiceroId))
            .ReturnsAsync(hechicero);
        _misionRepoMock.Setup(r => r.AddAsync(It.IsAny<Mision>()))
            .ReturnsAsync(misionCreada);
        _heRepoMock.Setup(r => r.AddAsync(It.IsAny<HechiceroEncargado>()))
            .ReturnsAsync(heCreado);
        _solicitudRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Solicitud>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.UpdateAsync(solicitudId, request);

        // Assert
        Assert.True(result.success, "La actualización debe ser exitosa");
        Assert.Contains("Misión y HechiceroEncargado generados", result.message);
        Assert.NotNull(result.generatedData);
        Assert.Equal(misionCreada.Id, result.generatedData.misionId);
        Assert.Equal(heCreado.Id, result.generatedData.hechiceroEncargadoId);

        // Verificar que se llamaron los métodos correctos
        _solicitudRepoMock.Verify(r => r.UpdateAsync(It.IsAny<Solicitud>()), Times.Once);
        _misionRepoMock.Verify(r => r.AddAsync(It.IsAny<Mision>()), Times.Once);
        _heRepoMock.Verify(r => r.AddAsync(It.IsAny<HechiceroEncargado>()), Times.Once);
    }

    // ============================================================================
    // PRUEBA 2: Validación - Falta HechiceroEncargadoId
    // ============================================================================
    [Fact]
    public async Task UpdateAsync_PendienteAAtendiendo_SinHechiceroId_RetornaError()
    {
        // Arrange
        var solicitudId = 1;
        var maldicion = TestDataFactory.CrearMaldicion(id: 5);

        var solicitudExistente = TestDataFactory.CrearSolicitud(
            id: solicitudId,
            maldicion: maldicion,
            estado: EEstadoSolicitud.pendiente
        );

        var request = new SolicitudUpdateRequest
        {
            Estado = EEstadoSolicitud.atendiendose,
            HechiceroEncargadoId = null,  // Falta!
            NivelUrgencia = Mision.ENivelUrgencia.Urgente
        };

        _solicitudRepoMock.Setup(r => r.GetByIdAsync(solicitudId))
            .ReturnsAsync(solicitudExistente);

        // Act
        var result = await _service.UpdateAsync(solicitudId, request);

        // Assert
        Assert.False(result.success);
        Assert.Contains("HechiceroEncargadoId", result.message);
        
        // Verificar que NO se llamaron los métodos de creación
        _misionRepoMock.Verify(r => r.AddAsync(It.IsAny<Mision>()), Times.Never);
        _heRepoMock.Verify(r => r.AddAsync(It.IsAny<HechiceroEncargado>()), Times.Never);
    }

    // ============================================================================
    // PRUEBA 3: Validación - Falta NivelUrgencia
    // ============================================================================
    [Fact]
    public async Task UpdateAsync_PendienteAAtendiendo_SinNivelUrgencia_RetornaError()
    {
        // Arrange
        var solicitudId = 1;
        var hechiceroId = 10;
        var maldicion = TestDataFactory.CrearMaldicion(id: 5);

        var solicitudExistente = TestDataFactory.CrearSolicitud(
            id: solicitudId,
            maldicion: maldicion,
            estado: EEstadoSolicitud.pendiente
        );

        var request = new SolicitudUpdateRequest
        {
            Estado = EEstadoSolicitud.atendiendose,
            HechiceroEncargadoId = hechiceroId,
            NivelUrgencia = null  // Falta!
        };

        _solicitudRepoMock.Setup(r => r.GetByIdAsync(solicitudId))
            .ReturnsAsync(solicitudExistente);

        // Act
        var result = await _service.UpdateAsync(solicitudId, request);

        // Assert
        Assert.False(result.success);
        Assert.Contains("NivelUrgencia", result.message);
        
        _misionRepoMock.Verify(r => r.AddAsync(It.IsAny<Mision>()), Times.Never);
        _heRepoMock.Verify(r => r.AddAsync(It.IsAny<HechiceroEncargado>()), Times.Never);
    }

    // ============================================================================
    // PRUEBA 4: Validación - Hechicero no existe
    // ============================================================================
    [Fact]
    public async Task UpdateAsync_PendienteAAtendiendo_HechiceroNoExiste_RetornaError()
    {
        // Arrange
        var solicitudId = 1;
        var hechiceroId = 999;  // No existe
        var maldicion = TestDataFactory.CrearMaldicion(id: 5);

        var solicitudExistente = TestDataFactory.CrearSolicitud(
            id: solicitudId,
            maldicion: maldicion,
            estado: EEstadoSolicitud.pendiente
        );

        var request = new SolicitudUpdateRequest
        {
            Estado = EEstadoSolicitud.atendiendose,
            HechiceroEncargadoId = hechiceroId,
            NivelUrgencia = Mision.ENivelUrgencia.Urgente
        };

        _solicitudRepoMock.Setup(r => r.GetByIdAsync(solicitudId))
            .ReturnsAsync(solicitudExistente);
        _hechiceroRepoMock.Setup(r => r.GetByIdAsync(hechiceroId))
            .ReturnsAsync((Hechicero?)null);  // No existe

        // Act
        var result = await _service.UpdateAsync(solicitudId, request);

        // Assert
        Assert.False(result.success);
        Assert.Contains("no existe", result.message.ToLower());
        
        _misionRepoMock.Verify(r => r.AddAsync(It.IsAny<Mision>()), Times.Never);
        _heRepoMock.Verify(r => r.AddAsync(It.IsAny<HechiceroEncargado>()), Times.Never);
    }

    // ============================================================================
    // PRUEBA 5: Transición atendiendose → pendiente elimina Misión + HechiceroEncargado
    // ============================================================================
    [Fact]
    public async Task UpdateAsync_AtendienteAPendiente_EliminaYHechiceroEncargado()
    {
        // Arrange
        var solicitudId = 1;
        var misionId = 100;
        var maldicion = TestDataFactory.CrearMaldicion(id: 5);

        var solicitudExistente = TestDataFactory.CrearSolicitud(
            id: solicitudId,
            maldicion: maldicion,
            estado: EEstadoSolicitud.atendiendose
        );

        var he = new HechiceroEncargado
        {
            Id = 1,
            HechiceroId = 10,
            SolicitudId = solicitudId,
            MisionId = misionId
        };

        var mision = TestDataFactory.CrearMision(id: misionId);

        var request = new SolicitudUpdateRequest
        {
            Estado = EEstadoSolicitud.pendiente
        };

        _solicitudRepoMock.Setup(r => r.GetByIdAsync(solicitudId))
            .ReturnsAsync(solicitudExistente);
        _heRepoMock.Setup(r => r.GetBySolicitudIdAsync(solicitudId))
            .ReturnsAsync(he);
        _misionRepoMock.Setup(r => r.GetByIdAsync(misionId))
            .ReturnsAsync(mision);
        _misionRepoMock.Setup(r => r.DeleteAsync(It.IsAny<Mision>()))
            .Returns(Task.CompletedTask);
        _heRepoMock.Setup(r => r.DeleteAsync(It.IsAny<HechiceroEncargado>()))
            .Returns(Task.CompletedTask);
        _solicitudRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Solicitud>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.UpdateAsync(solicitudId, request);

        // Assert
        Assert.True(result.success);
        Assert.Contains("devuelta a estado 'pendiente'", result.message);
        
        // Verificar que se eliminaron Misión y HechiceroEncargado
        _misionRepoMock.Verify(r => r.DeleteAsync(It.IsAny<Mision>()), Times.Once);
        _heRepoMock.Verify(r => r.DeleteAsync(It.IsAny<HechiceroEncargado>()), Times.Once);
        _solicitudRepoMock.Verify(r => r.UpdateAsync(It.IsAny<Solicitud>()), Times.Once);
    }

    // ============================================================================
    // PRUEBA 6: Transición atendiendose → atendida (sin cascada)
    // ============================================================================
    [Fact]
    public async Task UpdateAsync_AtendienteAAtendida_NoDispararaCascada()
    {
        // Arrange
        var solicitudId = 1;
        var maldicion = TestDataFactory.CrearMaldicion(id: 5);

        var solicitudExistente = TestDataFactory.CrearSolicitud(
            id: solicitudId,
            maldicion: maldicion,
            estado: EEstadoSolicitud.atendiendose
        );

        var request = new SolicitudUpdateRequest
        {
            Estado = EEstadoSolicitud.atendida
        };

        _solicitudRepoMock.Setup(r => r.GetByIdAsync(solicitudId))
            .ReturnsAsync(solicitudExistente);
        _solicitudRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Solicitud>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.UpdateAsync(solicitudId, request);

        // Assert
        Assert.True(result.success);
        Assert.Contains("atendida", result.message);
        
        // Verificar que NO se dispara lógica de cascada
        _misionRepoMock.Verify(r => r.AddAsync(It.IsAny<Mision>()), Times.Never);
        _misionRepoMock.Verify(r => r.DeleteAsync(It.IsAny<Mision>()), Times.Never);
        _heRepoMock.Verify(r => r.AddAsync(It.IsAny<HechiceroEncargado>()), Times.Never);
        _heRepoMock.Verify(r => r.DeleteAsync(It.IsAny<HechiceroEncargado>()), Times.Never);
    }

    // ============================================================================
    // PRUEBA 7: Transición no permitida (pendiente → atendida)
    // ============================================================================
    [Fact]
    public async Task UpdateAsync_TransicionNoPernmitida_RetornaError()
    {
        // Arrange
        var solicitudId = 1;
        var maldicion = TestDataFactory.CrearMaldicion(id: 5);

        var solicitudExistente = TestDataFactory.CrearSolicitud(
            id: solicitudId,
            maldicion: maldicion,
            estado: EEstadoSolicitud.pendiente
        );

        var request = new SolicitudUpdateRequest
        {
            Estado = EEstadoSolicitud.atendida  // No permitido desde pendiente
        };

        _solicitudRepoMock.Setup(r => r.GetByIdAsync(solicitudId))
            .ReturnsAsync(solicitudExistente);

        // Act
        var result = await _service.UpdateAsync(solicitudId, request);

        // Assert
        Assert.False(result.success);
        Assert.Contains("Transición de estado no permitida", result.message);
    }

    // ============================================================================
    // PRUEBA 8: DeleteAsync solo permite eliminar solicitudes en "pendiente"
    // ============================================================================
    [Fact]
    public async Task DeleteAsync_SolicitudEnPendiente_PermiteEliminar()
    {
        // Arrange
        var solicitudId = 1;
        var solicitud = TestDataFactory.CrearSolicitud(
            id: solicitudId,
            maldicion: TestDataFactory.CrearMaldicion(id: 5),
            estado: EEstadoSolicitud.pendiente
        );

        _solicitudRepoMock.Setup(r => r.GetByIdAsync(solicitudId))
            .ReturnsAsync(solicitud);
        _solicitudRepoMock.Setup(r => r.DeleteAsync(It.IsAny<Solicitud>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.DeleteAsync(solicitudId);

        // Assert
        Assert.True(result);
        _solicitudRepoMock.Verify(r => r.DeleteAsync(It.IsAny<Solicitud>()), Times.Once);
    }

    // ============================================================================
    // PRUEBA 9: DeleteAsync en "atendiendose" cambia Misión a Cancelada
    // ============================================================================
    [Fact]
    public async Task DeleteAsync_SolicitudEnAtendiendose_CancelaLaMisionYEliminaSolicitud()
    {
        // Arrange
        var solicitudId = 1;
        var misionId = 10;
        var hechiceroEncargadoId = 1;
        
        var solicitud = TestDataFactory.CrearSolicitud(
            id: solicitudId,
            maldicion: TestDataFactory.CrearMaldicion(id: 5),
            estado: EEstadoSolicitud.atendiendose
        );

        var mision = TestDataFactory.CrearMision(
            id: misionId,
            estado: Mision.EEstadoMision.EnProgreso
        );

        var he = TestDataFactory.CrearHechiceroEncargado(
            id: hechiceroEncargadoId,
            solicitudId: solicitudId,
            misionId: misionId
        );

        _solicitudRepoMock.Setup(r => r.GetByIdAsync(solicitudId))
            .ReturnsAsync(solicitud);
        _heRepoMock.Setup(r => r.GetBySolicitudIdAsync(solicitudId))
            .ReturnsAsync(he);
        _misionRepoMock.Setup(r => r.GetByIdAsync(misionId))
            .ReturnsAsync(mision);
        _misionRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Mision>()))
            .Returns(Task.CompletedTask);
        _solicitudRepoMock.Setup(r => r.DeleteAsync(It.IsAny<Solicitud>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.DeleteAsync(solicitudId);

        // Assert
        Assert.True(result);
        _misionRepoMock.Verify(r => r.UpdateAsync(It.Is<Mision>(m => m.Estado == Mision.EEstadoMision.Cancelada)), Times.Once);
        _solicitudRepoMock.Verify(r => r.DeleteAsync(It.IsAny<Solicitud>()), Times.Once);
    }

    // ============================================================================
    // PRUEBA 10: Solicitud no encontrada
    // ============================================================================
    [Fact]
    public async Task UpdateAsync_SolicitudNoExiste_RetornaError()
    {
        // Arrange
        var solicitudId = 999;

        var request = new SolicitudUpdateRequest
        {
            Estado = EEstadoSolicitud.atendiendose,
            HechiceroEncargadoId = 10,
            NivelUrgencia = Mision.ENivelUrgencia.Urgente
        };

        _solicitudRepoMock.Setup(r => r.GetByIdAsync(solicitudId))
            .ReturnsAsync((Solicitud?)null);

        // Act
        var result = await _service.UpdateAsync(solicitudId, request);

        // Assert
        Assert.False(result.success);
        Assert.Contains("no encontrada", result.message.ToLower());
    }
}
