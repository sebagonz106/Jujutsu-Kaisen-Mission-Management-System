using GestionDeMisiones.Tests.TestHelpers;
using GestionDeMisiones.Models;

namespace GestionDeMisiones.Tests.UnitTests.Models;

public class HechiceroTests
{
    [Fact]
    public void Hechicero_ValidarGradoYEstado_PropiedadesCorrectas()
    {
        // Arrange (Preparación)
        // Crear una técnica maldita de prueba primero
        var tecnicaPrincipal = TestDataFactory.CrearTecnicaMaldita(
            id: 1,
            nombre: "Límite Infinito",
            efectividadProm: 100
        );

        // Crear un hechicero con datos específicos usando TestDataFactory
        var hechicero = TestDataFactory.CrearHechicero(
            id: 1,
            nombre: "Satoru Gojo",
            grado: Hechicero.EGrados.especial,
            estado: Hechicero.EEstado.activo,
            experiencia: 15,
            tecnicaPrincipal: tecnicaPrincipal
        );

        // Act (Ejecución) - No hay acciones adicionales, solo verificación de creación

        // Assert (Verificación)
        // 1. Verificar que todas las propiedades básicas se asignen correctamente
        Assert.Equal(1, hechicero.Id);
        Assert.Equal("Satoru Gojo", hechicero.Name);
        Assert.Equal(15, hechicero.Experiencia);
        Assert.NotNull(hechicero.TecnicaPrincipal);
        Assert.Equal("Límite Infinito", hechicero.TecnicaPrincipal.Nombre);

        // 2. Validar que los valores de los enums (Grado y Estado) sean valores definidos
        // Verificar que el grado sea un valor válido del enum
        Assert.IsType<Hechicero.EGrados>(hechicero.Grado);
        Assert.True(Enum.IsDefined(typeof(Hechicero.EGrados), hechicero.Grado),
            $"El valor '{hechicero.Grado}' no está definido en el enum EGrados");
        
        // Verificar que el estado sea un valor válido del enum
        Assert.IsType<Hechicero.EEstado>(hechicero.Estado);
        Assert.True(Enum.IsDefined(typeof(Hechicero.EEstado), hechicero.Estado),
            $"El valor '{hechicero.Estado}' no está definido en el enum EEstado");

        // 3. Confirmar que las colecciones relacionadas se inicialicen como listas vacías
        Assert.NotNull(hechicero.Misiones);
        Assert.Empty(hechicero.Misiones);
        Assert.IsType<List<HechiceroEnMision>>(hechicero.Misiones);

        Assert.NotNull(hechicero.Traslados);
        Assert.Empty(hechicero.Traslados);
        Assert.IsType<List<Traslado>>(hechicero.Traslados);

        Assert.NotNull(hechicero.TecnicasMalditasDominadas);
        Assert.Empty(hechicero.TecnicasMalditasDominadas);
        Assert.IsType<List<TecnicaMalditaDominada>>(hechicero.TecnicasMalditasDominadas);

        // 4. Verificaciones adicionales de integridad
        // Verificar que la técnica principal tenga la referencia correcta
        Assert.Equal(1, hechicero.TecnicaPrincipal.Id);
        Assert.Equal(100, hechicero.TecnicaPrincipal.EfectividadProm);

        // Verificar que los valores específicos sean los esperados
        Assert.Equal(Hechicero.EGrados.especial, hechicero.Grado);
        Assert.Equal(Hechicero.EEstado.activo, hechicero.Estado);
    }

    [Fact]
    public void Hechicero_CrearSinTecnicaPrincipal_PropiedadesCorrectas()
    {
        // Arrange & Act
        var hechicero = TestDataFactory.CrearHechicero(
            id: 2,
            nombre: "Yuji Itadori",
            grado: Hechicero.EGrados.medio,
            estado: Hechicero.EEstado.activo,
            experiencia: 1,
            tecnicaPrincipal: null  // Sin técnica principal
        );

        // Assert
        Assert.Equal(2, hechicero.Id);
        Assert.Equal("Yuji Itadori", hechicero.Name);
        Assert.Equal(Hechicero.EGrados.medio, hechicero.Grado);
        Assert.Equal(Hechicero.EEstado.activo, hechicero.Estado);
        Assert.Equal(1, hechicero.Experiencia);
        Assert.Null(hechicero.TecnicaPrincipal);  // Acepta null

        // Las colecciones deben estar inicializadas
        Assert.NotNull(hechicero.Misiones);
        Assert.NotNull(hechicero.Traslados);
        Assert.NotNull(hechicero.TecnicasMalditasDominadas);
    }

    [Theory]
    [InlineData(Hechicero.EGrados.estudiante)]
    [InlineData(Hechicero.EGrados.aprendiz)]
    [InlineData(Hechicero.EGrados.medio)]
    [InlineData(Hechicero.EGrados.alto)]
    [InlineData(Hechicero.EGrados.especial)]
    public void Hechicero_TodosLosGradosValidos_CreaCorrectamente(Hechicero.EGrados grado)
    {
        // Arrange & Act
        var hechicero = TestDataFactory.CrearHechicero(
            id: 3,
            nombre: $"Hechicero Grado {grado}",
            grado: grado,
            estado: Hechicero.EEstado.activo,
            experiencia: 5
        );

        // Assert
        Assert.Equal(grado, hechicero.Grado);
        Assert.True(Enum.IsDefined(typeof(Hechicero.EGrados), hechicero.Grado));
    }

    [Theory]
    [InlineData(Hechicero.EEstado.activo)]
    [InlineData(Hechicero.EEstado.lesionado)]
    [InlineData(Hechicero.EEstado.recuperandose)]
    [InlineData(Hechicero.EEstado.baja)]
    [InlineData(Hechicero.EEstado.inactivo)]
    public void Hechicero_TodosLosEstadosValidos_CreaCorrectamente(Hechicero.EEstado estado)
    {
        // Arrange & Act
        var hechicero = TestDataFactory.CrearHechicero(
            id: 4,
            nombre: $"Hechicero Estado {estado}",
            grado: Hechicero.EGrados.medio,
            estado: estado,
            experiencia: 5
        );

        // Assert
        Assert.Equal(estado, hechicero.Estado);
        Assert.True(Enum.IsDefined(typeof(Hechicero.EEstado), hechicero.Estado));
    }
}