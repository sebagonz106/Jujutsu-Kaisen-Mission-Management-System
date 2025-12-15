using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Data;
using System;

namespace GestionDeMisiones.Tests.TestHelpers
{
    public static class TestDatabaseFactory
    {
        public static AppDbContext CreateContext(string? databaseName = null)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: databaseName ?? Guid.NewGuid().ToString())
                .Options;

            var context = new AppDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        public static AppDbContext CreateContextWithData()
        {
            var context = CreateContext();
            SeedTestData(context);
            return context;
        }

        private static void SeedTestData(AppDbContext context)
        {
            // 1. Crear ubicaciones
            var tokyo = TestDataFactory.CrearUbicacion(1, "Tokio");
            var shibuya = TestDataFactory.CrearUbicacion(2, "Shibuya");
            var kyoto = TestDataFactory.CrearUbicacion(3, "Kyoto");
            
            context.Ubicaciones.AddRange(tokyo, shibuya, kyoto);
            context.SaveChanges();

            // 2. Crear técnicas malditas
            var tecnica1 = TestDataFactory.CrearTecnicaMaldita(1, "Límite Infinito", efectividadProm: 100);
            var tecnica2 = TestDataFactory.CrearTecnicaMaldita(2, "Expansión de Dominio", TecnicaMaldita.ETipoTecnica.dominio, 95);
            var tecnica3 = TestDataFactory.CrearTecnicaMaldita(3, "Manipulación de Sombras", TecnicaMaldita.ETipoTecnica.restriccion, 85);
            
            context.TecnicasMalditas.AddRange(tecnica1, tecnica2, tecnica3);
            context.SaveChanges();

            // 3. Crear hechiceros
            var gojo = TestDataFactory.CrearHechicero(1, "Satoru Gojo", Hechicero.EGrados.especial, experiencia: 15, tecnicaPrincipal: tecnica1);
            var nanami = TestDataFactory.CrearHechicero(2, "Nanami Kento", Hechicero.EGrados.alto, experiencia: 10);
            var yuji = TestDataFactory.CrearHechicero(3, "Yuji Itadori", Hechicero.EGrados.medio, experiencia: 1);
            var megumi = TestDataFactory.CrearHechicero(4, "Megumi Fushiguro", Hechicero.EGrados.medio, experiencia: 2, tecnicaPrincipal: tecnica3);
            var nobara = TestDataFactory.CrearHechicero(5, "Nobara Kugisaki", Hechicero.EGrados.medio, experiencia: 1);
            
            context.Hechiceros.AddRange(gojo, nanami, yuji, megumi, nobara);
            context.SaveChanges();

            // 4. Crear maldiciones
            var maldicion1 = TestDataFactory.CrearMaldicion(1, "Maldición Especial", Maldicion.EGrado.especial, 
                nivelPeligro: Maldicion.ENivelPeligro.alto, ubicacion: shibuya);
            var maldicion2 = TestDataFactory.CrearMaldicion(2, "Maldición Grado 1", Maldicion.EGrado.grado_1, 
                ubicacion: tokyo);
            var maldicion3 = TestDataFactory.CrearMaldicion(3, "Maldición Residual", tipo: Maldicion.ETipo.residual,
                estado: Maldicion.EEstadoActual.exorcisada, ubicacion: kyoto);
            
            context.Maldiciones.AddRange(maldicion1, maldicion2, maldicion3);
            context.SaveChanges();

            // 5. Crear misiones
            var mision1 = TestDataFactory.CrearMision(1, "Exorcizar maldición especial en Shibuya", 
                Mision.EEstadoMision.CompletadaConExito, Mision.ENivelUrgencia.EmergenciaCritica,
                DateTime.Now.AddDays(-10), DateTime.Now.AddDays(-9), shibuya);
            
            var mision2 = TestDataFactory.CrearMision(2, "Misión planificada en Tokio", 
                Mision.EEstadoMision.Pendiente, Mision.ENivelUrgencia.Planificada,
                DateTime.Now.AddDays(2), null, tokyo);
            
            var mision3 = TestDataFactory.CrearMision(3, "Misión urgente en Kyoto", 
                Mision.EEstadoMision.EnProgreso, Mision.ENivelUrgencia.Urgente,
                DateTime.Now.AddHours(-2), null, kyoto);
            
            context.Misiones.AddRange(mision1, mision2, mision3);
            context.SaveChanges();

            // 6. Crear solicitudes
            var solicitud1 = TestDataFactory.CrearSolicitud(1, maldicion1, EEstadoSolicitud.atendida);
            var solicitud2 = TestDataFactory.CrearSolicitud(2, maldicion2, EEstadoSolicitud.pendiente);
            
            context.Solicitud.AddRange(solicitud1, solicitud2);
            context.SaveChanges();

            // 7. Crear subordinaciones
            var sub1 = TestDataFactory.CrearSubordinacion(1, 1, 2, Subordinacion.ETipoRelacion.Tutoría); // Gojo -> Nanami
            var sub2 = TestDataFactory.CrearSubordinacion(2, 1, 3, Subordinacion.ETipoRelacion.Tutoría); // Gojo -> Yuji
            var sub3 = TestDataFactory.CrearSubordinacion(3, 2, 4, Subordinacion.ETipoRelacion.Supervisión); // Nanami -> Megumi
            
            context.Subordinaciones.AddRange(sub1, sub2, sub3);
            context.SaveChanges();

            // 8. Crear técnicas dominadas
            var dominio1 = TestDataFactory.CrearTecnicaMalditaDominada(1, 1, 100f); // Gojo domina Límite Infinito
            var dominio2 = TestDataFactory.CrearTecnicaMalditaDominada(3, 3, 80f); // Yuji domina Manipulación de Sombras
            var dominio3 = TestDataFactory.CrearTecnicaMalditaDominada(4, 3, 90f); // Megumi domina Manipulación de Sombras
            
            context.TecnicasMalditasDominadas.AddRange(dominio1, dominio2, dominio3);
            context.SaveChanges();

            // 9. Crear hechiceros en misiones (participaciones)
            var part1 = TestDataFactory.CrearHechiceroEnMision(1, 1, 1, gojo, mision1); // Gojo en misión 1
            var part2 = TestDataFactory.CrearHechiceroEnMision(2, 3, 1, yuji, mision1); // Yuji en misión 1
            var part3 = TestDataFactory.CrearHechiceroEnMision(3, 2, 2, nanami, mision2); // Nanami en misión 2
            
            context.HechiceroEnMision.AddRange(part1, part2, part3);
            context.SaveChanges();

            // NOTA: No creamos TecnicaMalditaAplicada porque no tenemos el modelo completo
            // Se puede agregar después cuando tengamos el modelo
        }

        public static void ClearData(AppDbContext context)
        {
            // Limpiar en orden inverso por dependencias
            if (context.TecnicaMalditaAplicada != null)
                context.TecnicaMalditaAplicada.RemoveRange(context.TecnicaMalditaAplicada);
            
            context.HechiceroEnMision.RemoveRange(context.HechiceroEnMision);
            context.TecnicasMalditasDominadas.RemoveRange(context.TecnicasMalditasDominadas);
            context.Subordinaciones.RemoveRange(context.Subordinaciones);
            context.Solicitud.RemoveRange(context.Solicitud);
            context.Misiones.RemoveRange(context.Misiones);
            context.Maldiciones.RemoveRange(context.Maldiciones);
            context.Hechiceros.RemoveRange(context.Hechiceros);
            context.TecnicasMalditas.RemoveRange(context.TecnicasMalditas);
            context.Ubicaciones.RemoveRange(context.Ubicaciones);
            
            context.SaveChanges();
        }
    }
}