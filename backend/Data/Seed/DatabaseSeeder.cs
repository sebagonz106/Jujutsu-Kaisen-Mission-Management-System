using GestionDeMisiones.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionDeMisiones.Data.Seed
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAllAsync(AppDbContext context)
        {
            // Verificar si ya hay datos
            if (await context.Hechiceros.AnyAsync())
            {
                Console.WriteLine("La base de datos ya contiene datos. Saltando seeding.");
                return;
            }

            Console.WriteLine("Iniciando población de base de datos...");

            // 1. Usuarios
            await SeedUsuarios(context);
            
            // 2. Ubicaciones
            await SeedUbicaciones(context);
            
            // 3. Técnicas Malditas
            await SeedTecnicasMalditas(context);
            
            // 4. Hechiceros
            await SeedHechiceros(context);
            
            // 5. Maldiciones
            await SeedMaldiciones(context);
            
            // 6. Personal de Apoyo
            await SeedPersonalDeApoyo(context);
            
            // 7. Recursos
            await SeedRecursos(context);
            
            // 8. Misiones
            await SeedMisiones(context);
            
            // 9. Técnicas Dominadas
            await SeedTecnicasDominadas(context);
            
            // 10. Hechiceros en Misión
            await SeedHechicerosEnMision(context);
            
            // 11. Traslados
            await SeedTraslados(context);
            
            // 12. Uso de Recursos
            await SeedUsoDeRecursos(context);
            
            // 13. Técnicas Aplicadas
            await SeedTecnicasAplicadas(context);

            // 14. Subordinaciones
            await SeedSubordinaciones(context);

            Console.WriteLine("Base de datos poblada exitosamente!");
        }

        private static async Task SeedUsuarios(AppDbContext context)
        {
            var usuarios = new List<Usuario>
            {
                new Usuario { Nombre = "Admin", Email = "admin@jujutsu.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), Rol = "admin", Rango = null },
                new Usuario { Nombre = "Satoru Gojo", Email = "gojo@jujutsu.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("gojo123"), Rol = "hechicero", Rango = "especial" },
                new Usuario { Nombre = "Yuji Itadori", Email = "itadori@jujutsu.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("itadori123"), Rol = "hechicero", Rango = "estudiante" },
                new Usuario { Nombre = "Megumi Fushiguro", Email = "fushiguro@jujutsu.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("megumi123"), Rol = "hechicero", Rango = "grado_2" },
                new Usuario { Nombre = "Nobara Kugisaki", Email = "kugisaki@jujutsu.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("nobara123"), Rol = "hechicero", Rango = "grado_3" },
                new Usuario { Nombre = "Observador", Email = "observer@jujutsu.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("observer123"), Rol = "observador", Rango = null },
                new Usuario { Nombre = "Soporte", Email = "support@jujutsu.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("support123"), Rol = "support", Rango = null }
            };
            
            await context.Usuarios.AddRangeAsync(usuarios);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {usuarios.Count} usuarios creados");
        }

        private static async Task SeedUbicaciones(AppDbContext context)
        {
            var ubicaciones = new List<Ubicacion>
            {
                new Ubicacion { Nombre = "Tokyo Jujutsu High School" },
                new Ubicacion { Nombre = "Shibuya" },
                new Ubicacion { Nombre = "Kyoto Jujutsu High School" },
                new Ubicacion { Nombre = "Distrito Comercial de Shibuya" },
                new Ubicacion { Nombre = "Bosque de Aokigahara" },
                new Ubicacion { Nombre = "Estadio Nacional" },
                new Ubicacion { Nombre = "Hospital Central de Tokyo" },
                new Ubicacion { Nombre = "Zona Industrial" },
                new Ubicacion { Nombre = "Templo Abandonado" },
                new Ubicacion { Nombre = "Centro Comercial Metropolitano" }
            };
            
            await context.Ubicaciones.AddRangeAsync(ubicaciones);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {ubicaciones.Count} ubicaciones creadas");
        }

        private static async Task SeedTecnicasMalditas(AppDbContext context)
        {
            var tecnicas = new List<TecnicaMaldita>
            {
                new TecnicaMaldita { Nombre = "Limitless", Tipo = TecnicaMaldita.ETipoTecnica.dominio, EfectividadProm = 95, CondicionesDeUso = "Solo familia Gojo" },
                new TecnicaMaldita { Nombre = "Six Eyes", Tipo = TecnicaMaldita.ETipoTecnica.amplificacion, EfectividadProm = 98, CondicionesDeUso = "Rasgo heredado Gojo" },
                new TecnicaMaldita { Nombre = "Ten Shadows", Tipo = TecnicaMaldita.ETipoTecnica.dominio, EfectividadProm = 85, CondicionesDeUso = "Familia Zenin" },
                new TecnicaMaldita { Nombre = "Divergent Fist", Tipo = TecnicaMaldita.ETipoTecnica.amplificacion, EfectividadProm = 70, CondicionesDeUso = "Control de energía maldita imperfecto" },
                new TecnicaMaldita { Nombre = "Black Flash", Tipo = TecnicaMaldita.ETipoTecnica.amplificacion, EfectividadProm = 90, CondicionesDeUso = "Timing perfecto de 0.000001 segundos" },
                new TecnicaMaldita { Nombre = "Straw Doll Technique", Tipo = TecnicaMaldita.ETipoTecnica.restriccion, EfectividadProm = 75, CondicionesDeUso = "Uso de clavos y muñecos" },
                new TecnicaMaldita { Nombre = "Boogie Woogie", Tipo = TecnicaMaldita.ETipoTecnica.soporte, EfectividadProm = 80, CondicionesDeUso = "Palmada" },
                new TecnicaMaldita { Nombre = "Cursed Speech", Tipo = TecnicaMaldita.ETipoTecnica.restriccion, EfectividadProm = 88, CondicionesDeUso = "Palabras malditas" },
                new TecnicaMaldita { Nombre = "Construction", Tipo = TecnicaMaldita.ETipoTecnica.soporte, EfectividadProm = 65, CondicionesDeUso = "Creación de objetos" },
                new TecnicaMaldita { Nombre = "Ratio Technique", Tipo = TecnicaMaldita.ETipoTecnica.amplificacion, EfectividadProm = 82, CondicionesDeUso = "Puntos débiles identificados" },
                new TecnicaMaldita { Nombre = "Blood Manipulation", Tipo = TecnicaMaldita.ETipoTecnica.dominio, EfectividadProm = 87, CondicionesDeUso = "Control de sangre propia o ajena" },
                new TecnicaMaldita { Nombre = "Idle Transfiguration", Tipo = TecnicaMaldita.ETipoTecnica.restriccion, EfectividadProm = 92, CondicionesDeUso = "Toque directo del alma" }
            };
            
            await context.TecnicasMalditas.AddRangeAsync(tecnicas);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {tecnicas.Count} técnicas malditas creadas");
        }

        private static async Task SeedHechiceros(AppDbContext context)
        {
            var hechiceros = new List<Hechicero>
            {
                new Hechicero { Name = "Satoru Gojo", Grado = Hechicero.EGrados.especial, Experiencia = 15000, Estado = Hechicero.EEstado.activo, TecnicaPrincipalId = 1 },
                new Hechicero { Name = "Yuji Itadori", Grado = Hechicero.EGrados.estudiante, Experiencia = 2500, Estado = Hechicero.EEstado.activo, TecnicaPrincipalId = 4 },
                new Hechicero { Name = "Megumi Fushiguro", Grado = Hechicero.EGrados.medio, Experiencia = 4200, Estado = Hechicero.EEstado.activo, TecnicaPrincipalId = 3 },
                new Hechicero { Name = "Nobara Kugisaki", Grado = Hechicero.EGrados.aprendiz, Experiencia = 3800, Estado = Hechicero.EEstado.activo, TecnicaPrincipalId = 6 },
                new Hechicero { Name = "Maki Zenin", Grado = Hechicero.EGrados.medio, Experiencia = 5500, Estado = Hechicero.EEstado.activo, TecnicaPrincipalId = 9 },
                new Hechicero { Name = "Toge Inumaki", Grado = Hechicero.EGrados.alto, Experiencia = 6200, Estado = Hechicero.EEstado.activo, TecnicaPrincipalId = 8 },
                new Hechicero { Name = "Panda", Grado = Hechicero.EGrados.alto, Experiencia = 5800, Estado = Hechicero.EEstado.activo, TecnicaPrincipalId = 9 },
                new Hechicero { Name = "Kento Nanami", Grado = Hechicero.EGrados.alto, Experiencia = 9500, Estado = Hechicero.EEstado.lesionado, TecnicaPrincipalId = 10 },
                new Hechicero { Name = "Aoi Todo", Grado = Hechicero.EGrados.alto, Experiencia = 8700, Estado = Hechicero.EEstado.activo, TecnicaPrincipalId = 7 },
                new Hechicero { Name = "Yuta Okkotsu", Grado = Hechicero.EGrados.especial, Experiencia = 12000, Estado = Hechicero.EEstado.activo, TecnicaPrincipalId = 1 },
                new Hechicero { Name = "Mai Zenin", Grado = Hechicero.EGrados.aprendiz, Experiencia = 3200, Estado = Hechicero.EEstado.recuperandose, TecnicaPrincipalId = 9 },
                new Hechicero { Name = "Noritoshi Kamo", Grado = Hechicero.EGrados.alto, Experiencia = 6500, Estado = Hechicero.EEstado.activo, TecnicaPrincipalId = 11 }
            };
            
            await context.Hechiceros.AddRangeAsync(hechiceros);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {hechiceros.Count} hechiceros creados");
        }

        private static async Task SeedMaldiciones(AppDbContext context)
        {
            var maldiciones = new List<Maldicion>
            {
                new Maldicion { Nombre = "Ryomen Sukuna", FechaYHoraDeAparicion = DateTime.Now.AddDays(-1000), Grado = Maldicion.EGrado.especial, Tipo = Maldicion.ETipo.maligna, EstadoActual = Maldicion.EEstadoActual.activa, NivelPeligro = Maldicion.ENivelPeligro.alto, UbicacionDeAparicionId = 1 },
                new Maldicion { Nombre = "Mahito", FechaYHoraDeAparicion = DateTime.Now.AddDays(-180), Grado = Maldicion.EGrado.especial, Tipo = Maldicion.ETipo.maligna, EstadoActual = Maldicion.EEstadoActual.exorcisada, NivelPeligro = Maldicion.ENivelPeligro.alto, UbicacionDeAparicionId = 2 },
                new Maldicion { Nombre = "Jogo", FechaYHoraDeAparicion = DateTime.Now.AddDays(-200), Grado = Maldicion.EGrado.especial, Tipo = Maldicion.ETipo.maligna, EstadoActual = Maldicion.EEstadoActual.exorcisada, NivelPeligro = Maldicion.ENivelPeligro.alto, UbicacionDeAparicionId = 5 },
                new Maldicion { Nombre = "Hanami", FechaYHoraDeAparicion = DateTime.Now.AddDays(-190), Grado = Maldicion.EGrado.especial, Tipo = Maldicion.ETipo.maligna, EstadoActual = Maldicion.EEstadoActual.exorcisada, NivelPeligro = Maldicion.ENivelPeligro.alto, UbicacionDeAparicionId = 3 },
                new Maldicion { Nombre = "Dagon", FechaYHoraDeAparicion = DateTime.Now.AddDays(-150), Grado = Maldicion.EGrado.especial, Tipo = Maldicion.ETipo.maligna, EstadoActual = Maldicion.EEstadoActual.exorcisada, NivelPeligro = Maldicion.ENivelPeligro.alto, UbicacionDeAparicionId = 4 },
                new Maldicion { Nombre = "Cursed Spirit Grade 1 (Shibuya)", FechaYHoraDeAparicion = DateTime.Now.AddDays(-30), Grado = Maldicion.EGrado.grado_1, Tipo = Maldicion.ETipo.semi_maldicion, EstadoActual = Maldicion.EEstadoActual.en_proceso_de_exorcismo, NivelPeligro = Maldicion.ENivelPeligro.moderado, UbicacionDeAparicionId = 2 },
                new Maldicion { Nombre = "Cursed Spirit Grade 2 (Hospital)", FechaYHoraDeAparicion = DateTime.Now.AddDays(-15), Grado = Maldicion.EGrado.grado_2, Tipo = Maldicion.ETipo.residual, EstadoActual = Maldicion.EEstadoActual.activa, NivelPeligro = Maldicion.ENivelPeligro.bajo, UbicacionDeAparicionId = 7 },
                new Maldicion { Nombre = "Cursed Spirit Grade 3 (Mall)", FechaYHoraDeAparicion = DateTime.Now.AddDays(-5), Grado = Maldicion.EGrado.grado_3, Tipo = Maldicion.ETipo.residual, EstadoActual = Maldicion.EEstadoActual.activa, NivelPeligro = Maldicion.ENivelPeligro.bajo, UbicacionDeAparicionId = 10 },
                new Maldicion { Nombre = "Semi-Grade 1 Spirit (Industrial Zone)", FechaYHoraDeAparicion = DateTime.Now.AddDays(-45), Grado = Maldicion.EGrado.semi_especial, Tipo = Maldicion.ETipo.desconocida, EstadoActual = Maldicion.EEstadoActual.activa, NivelPeligro = Maldicion.ENivelPeligro.moderado, UbicacionDeAparicionId = 8 },
                new Maldicion { Nombre = "Temple Guardian Spirit", FechaYHoraDeAparicion = DateTime.Now.AddDays(-365), Grado = Maldicion.EGrado.grado_1, Tipo = Maldicion.ETipo.semi_maldicion, EstadoActual = Maldicion.EEstadoActual.en_proceso_de_exorcismo, NivelPeligro = Maldicion.ENivelPeligro.moderado, UbicacionDeAparicionId = 9 }
            };
            
            await context.Maldiciones.AddRangeAsync(maldiciones);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {maldiciones.Count} maldiciones creadas");
        }

        private static async Task SeedPersonalDeApoyo(AppDbContext context)
        {
            var personal = new List<PersonalDeApoyo>
            {
                new PersonalDeApoyo { Name = "Kiyotaka Ijichi" },
                new PersonalDeApoyo { Name = "Akari Nitta" },
                new PersonalDeApoyo { Name = "Shoko Ieiri" },
                new PersonalDeApoyo { Name = "Atsuya Kusakabe" },
                new PersonalDeApoyo { Name = "Masamichi Yaga" }
            };
            
            await context.PersonalDeApoyo.AddRangeAsync(personal);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {personal.Count} personal de apoyo creado");
        }

        private static async Task SeedRecursos(AppDbContext context)
        {
            var recursos = new List<Recurso>
            {
                new Recurso { Nombre = "Katana Maldita", TipoRecurso = Recurso.ETipoRecurso.EquipamientoDeCombate, Descripcion = "Espada imbuida con energía maldita", CantidadDisponible = 15 },
                new Recurso { Nombre = "Clavos Malditos", TipoRecurso = Recurso.ETipoRecurso.EquipamientoDeCombate, Descripcion = "Clavos para técnica de muñeco de paja", CantidadDisponible = 200 },
                new Recurso { Nombre = "Vehículo Blindado", TipoRecurso = Recurso.ETipoRecurso.Transporte, Descripcion = "Vehículo con protección contra maldiciones", CantidadDisponible = 8 },
                new Recurso { Nombre = "Kit Médico Avanzado", TipoRecurso = Recurso.ETipoRecurso.Suministros, Descripcion = "Suministros médicos para heridas en combate", CantidadDisponible = 25 },
                new Recurso { Nombre = "Detector de Energía Maldita", TipoRecurso = Recurso.ETipoRecurso.Herramienta, Descripcion = "Dispositivo para detectar presencia maldita", CantidadDisponible = 12 },
                new Recurso { Nombre = "Sello de Contención", TipoRecurso = Recurso.ETipoRecurso.Herramienta, Descripcion = "Talismanes para contener maldiciones", CantidadDisponible = 50 },
                new Recurso { Nombre = "Munición Especial", TipoRecurso = Recurso.ETipoRecurso.EquipamientoDeCombate, Descripcion = "Balas imbuidas con energía maldita", CantidadDisponible = 500 },
                new Recurso { Nombre = "Helicóptero de Transporte", TipoRecurso = Recurso.ETipoRecurso.Transporte, Descripcion = "Para evacuaciones rápidas", CantidadDisponible = 3 },
                new Recurso { Nombre = "Barrera Portátil", TipoRecurso = Recurso.ETipoRecurso.Herramienta, Descripcion = "Crea barreras temporales", CantidadDisponible = 20 },
                new Recurso { Nombre = "Ración de Emergencia", TipoRecurso = Recurso.ETipoRecurso.Suministros, Descripcion = "Comida y agua para misiones largas", CantidadDisponible = 100 }
            };
            
            await context.Recursos.AddRangeAsync(recursos);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {recursos.Count} recursos creados");
        }

        private static async Task SeedMisiones(AppDbContext context)
        {
            var misiones = new List<Mision>
            {
                new Mision 
                { 
                    FechaYHoraDeInicio = DateTime.Now.AddDays(-60),
                    FechaYHoraDeFin = DateTime.Now.AddDays(-59),
                    UbicacionId = 2,
                    Estado = Mision.EEstadoMision.CompletadaConExito,
                    EventosOcurridos = "Incidente de Shibuya. Múltiples maldiciones especiales enfrentadas.",
                    DannosColaterales = "Destrucción masiva en el distrito de Shibuya. Múltiples bajas civiles.",
                    NivelUrgencia = Mision.ENivelUrgencia.EmergenciaCritica
                },
                new Mision 
                { 
                    FechaYHoraDeInicio = DateTime.Now.AddDays(-30),
                    FechaYHoraDeFin = DateTime.Now.AddDays(-29),
                    UbicacionId = 7,
                    Estado = Mision.EEstadoMision.CompletadaConExito,
                    EventosOcurridos = "Eliminación de maldición grado 2 en hospital. Sin complicaciones.",
                    DannosColaterales = "Daños mínimos, una ala del hospital evacuada.",
                    NivelUrgencia = Mision.ENivelUrgencia.Urgente
                },
                new Mision 
                { 
                    FechaYHoraDeInicio = DateTime.Now.AddDays(-15),
                    FechaYHoraDeFin = null,
                    UbicacionId = 8,
                    Estado = Mision.EEstadoMision.EnProgreso,
                    EventosOcurridos = "Investigación en zona industrial. Maldición semi-especial detectada.",
                    DannosColaterales = "Ninguno hasta el momento.",
                    NivelUrgencia = Mision.ENivelUrgencia.Urgente
                },
                new Mision 
                { 
                    FechaYHoraDeInicio = DateTime.Now.AddDays(-5),
                    FechaYHoraDeFin = null,
                    UbicacionId = 10,
                    Estado = Mision.EEstadoMision.Pendiente,
                    EventosOcurridos = "Reporte de actividad maldita en centro comercial.",
                    DannosColaterales = "N/A",
                    NivelUrgencia = Mision.ENivelUrgencia.Planificada
                },
                new Mision 
                { 
                    FechaYHoraDeInicio = DateTime.Now.AddDays(-90),
                    FechaYHoraDeFin = DateTime.Now.AddDays(-88),
                    UbicacionId = 3,
                    Estado = Mision.EEstadoMision.CompletadaConExito,
                    EventosOcurridos = "Intercambio estudiantil. Enfrentamiento con espíritus malditos grado 1.",
                    DannosColaterales = "Daños moderados en instalaciones de entrenamiento.",
                    NivelUrgencia = Mision.ENivelUrgencia.Urgente
                },
                new Mision 
                { 
                    FechaYHoraDeInicio = DateTime.Now.AddDays(-2),
                    FechaYHoraDeFin = null,
                    UbicacionId = 9,
                    Estado = Mision.EEstadoMision.Cancelada,
                    EventosOcurridos = "Misión cancelada debido a información falsa.",
                    DannosColaterales = "Ninguno.",
                    NivelUrgencia = Mision.ENivelUrgencia.Planificada
                },
                new Mision 
                { 
                    FechaYHoraDeInicio = DateTime.Now.AddDays(-120),
                    FechaYHoraDeFin = DateTime.Now.AddDays(-119),
                    UbicacionId = 5,
                    Estado = Mision.EEstadoMision.CompletadaConFracaso,
                    EventosOcurridos = "Enfrentamiento con Jogo. Imposible de completar sin refuerzos.",
                    DannosColaterales = "Incendio forestal extenso. Área evacuada.",
                    NivelUrgencia = Mision.ENivelUrgencia.EmergenciaCritica
                },
                new Mision 
                { 
                    FechaYHoraDeInicio = DateTime.Now.AddHours(-6),
                    FechaYHoraDeFin = null,
                    UbicacionId = 1,
                    Estado = Mision.EEstadoMision.EnProgreso,
                    EventosOcurridos = "Entrenamiento de campo para estudiantes de primer año.",
                    DannosColaterales = "Ninguno.",
                    NivelUrgencia = Mision.ENivelUrgencia.Planificada
                }
            };
            
            await context.Misiones.AddRangeAsync(misiones);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {misiones.Count} misiones creadas");
        }

        private static async Task SeedTecnicasDominadas(AppDbContext context)
        {
            var tecnicasDominadas = new List<TecnicaMalditaDominada>
            {
                // Gojo domina Limitless y Six Eyes
                new TecnicaMalditaDominada { HechiceroId = 1, TecnicaMalditaId = 1, NivelDeDominio = 100 },
                new TecnicaMalditaDominada { HechiceroId = 1, TecnicaMalditaId = 2, NivelDeDominio = 100 },
                // Yuji domina Divergent Fist y Black Flash
                new TecnicaMalditaDominada { HechiceroId = 2, TecnicaMalditaId = 4, NivelDeDominio = 75 },
                new TecnicaMalditaDominada { HechiceroId = 2, TecnicaMalditaId = 5, NivelDeDominio = 80 },
                // Megumi domina Ten Shadows
                new TecnicaMalditaDominada { HechiceroId = 3, TecnicaMalditaId = 3, NivelDeDominio = 70 },
                // Nobara domina Straw Doll
                new TecnicaMalditaDominada { HechiceroId = 4, TecnicaMalditaId = 6, NivelDeDominio = 85 },
                // Maki domina Construction
                new TecnicaMalditaDominada { HechiceroId = 5, TecnicaMalditaId = 9, NivelDeDominio = 60 },
                // Inumaki domina Cursed Speech
                new TecnicaMalditaDominada { HechiceroId = 6, TecnicaMalditaId = 8, NivelDeDominio = 95 },
                // Nanami domina Ratio
                new TecnicaMalditaDominada { HechiceroId = 8, TecnicaMalditaId = 10, NivelDeDominio = 90 },
                new TecnicaMalditaDominada { HechiceroId = 8, TecnicaMalditaId = 5, NivelDeDominio = 85 },
                // Todo domina Boogie Woogie y Black Flash
                new TecnicaMalditaDominada { HechiceroId = 9, TecnicaMalditaId = 7, NivelDeDominio = 100 },
                new TecnicaMalditaDominada { HechiceroId = 9, TecnicaMalditaId = 5, NivelDeDominio = 90 },
                // Yuta domina múltiples técnicas
                new TecnicaMalditaDominada { HechiceroId = 10, TecnicaMalditaId = 1, NivelDeDominio = 70 },
                new TecnicaMalditaDominada { HechiceroId = 10, TecnicaMalditaId = 8, NivelDeDominio = 65 },
                // Kamo domina Blood Manipulation
                new TecnicaMalditaDominada { HechiceroId = 12, TecnicaMalditaId = 11, NivelDeDominio = 88 }
            };
            
            await context.TecnicasMalditasDominadas.AddRangeAsync(tecnicasDominadas);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {tecnicasDominadas.Count} técnicas dominadas asignadas");
        }

        private static async Task SeedHechicerosEnMision(AppDbContext context)
        {
            var hechicerosEnMision = new List<HechiceroEnMision>
            {
                // Incidente de Shibuya (Misión 1)
                new HechiceroEnMision { MisionId = 1, HechiceroId = 1 }, // Gojo
                new HechiceroEnMision { MisionId = 1, HechiceroId = 2 }, // Yuji
                new HechiceroEnMision { MisionId = 1, HechiceroId = 3 }, // Megumi
                new HechiceroEnMision { MisionId = 1, HechiceroId = 8 }, // Nanami
                // Hospital (Misión 2)
                new HechiceroEnMision { MisionId = 2, HechiceroId = 4 }, // Nobara
                new HechiceroEnMision { MisionId = 2, HechiceroId = 5 }, // Maki
                // Zona Industrial (Misión 3)
                new HechiceroEnMision { MisionId = 3, HechiceroId = 9 }, // Todo
                new HechiceroEnMision { MisionId = 3, HechiceroId = 12 }, // Kamo
                // Centro Comercial (Misión 4)
                new HechiceroEnMision { MisionId = 4, HechiceroId = 2 }, // Yuji
                new HechiceroEnMision { MisionId = 4, HechiceroId = 3 }, // Megumi
                new HechiceroEnMision { MisionId = 4, HechiceroId = 4 }, // Nobara
                // Intercambio Kyoto (Misión 5)
                new HechiceroEnMision { MisionId = 5, HechiceroId = 2 }, // Yuji
                new HechiceroEnMision { MisionId = 5, HechiceroId = 3 }, // Megumi
                new HechiceroEnMision { MisionId = 5, HechiceroId = 5 }, // Maki
                new HechiceroEnMision { MisionId = 5, HechiceroId = 6 }, // Inumaki
                new HechiceroEnMision { MisionId = 5, HechiceroId = 7 }, // Panda
                // Bosque (Misión 7)
                new HechiceroEnMision { MisionId = 7, HechiceroId = 1 }, // Gojo
                new HechiceroEnMision { MisionId = 7, HechiceroId = 2 }, // Yuji
                // Entrenamiento (Misión 8)
                new HechiceroEnMision { MisionId = 8, HechiceroId = 2 }, // Yuji
                new HechiceroEnMision { MisionId = 8, HechiceroId = 3 }, // Megumi
                new HechiceroEnMision { MisionId = 8, HechiceroId = 4 }  // Nobara
            };
            
            await context.HechiceroEnMision.AddRangeAsync(hechicerosEnMision);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {hechicerosEnMision.Count} asignaciones de hechiceros a misiones creadas");
        }

        private static async Task SeedTraslados(AppDbContext context)
        {
            // Los traslados requieren Origen y Destino (Ubicacion), que son objetos completos
            // Por simplicidad, omitimos esta sección ya que requiere carga de ubicaciones primero
            Console.WriteLine("✓ Traslados omitidos (requieren configuración adicional)");
            await Task.CompletedTask;
        }

        private static async Task SeedUsoDeRecursos(AppDbContext context)
        {
            var usos = new List<UsoDeRecurso>
            {
                // Shibuya
                new UsoDeRecurso { MisionId = 1, RecursoId = 1, Cantidad = 5, FechaInicio = DateTime.Now.AddDays(-60) },
                new UsoDeRecurso { MisionId = 1, RecursoId = 4, Cantidad = 10, FechaInicio = DateTime.Now.AddDays(-60) },
                new UsoDeRecurso { MisionId = 1, RecursoId = 5, Cantidad = 3, FechaInicio = DateTime.Now.AddDays(-60) },
                // Hospital
                new UsoDeRecurso { MisionId = 2, RecursoId = 2, Cantidad = 20, FechaInicio = DateTime.Now.AddDays(-30) },
                new UsoDeRecurso { MisionId = 2, RecursoId = 4, Cantidad = 3, FechaInicio = DateTime.Now.AddDays(-30) },
                // Zona Industrial
                new UsoDeRecurso { MisionId = 3, RecursoId = 6, Cantidad = 5, FechaInicio = DateTime.Now.AddDays(-15) },
                new UsoDeRecurso { MisionId = 3, RecursoId = 9, Cantidad = 2, FechaInicio = DateTime.Now.AddDays(-15) },
                // Centro Comercial
                new UsoDeRecurso { MisionId = 4, RecursoId = 5, Cantidad = 1, FechaInicio = DateTime.Now.AddDays(-5) },
                new UsoDeRecurso { MisionId = 4, RecursoId = 10, Cantidad = 5, FechaInicio = DateTime.Now.AddDays(-5) },
                // Intercambio
                new UsoDeRecurso { MisionId = 5, RecursoId = 1, Cantidad = 3, FechaInicio = DateTime.Now.AddDays(-90) },
                new UsoDeRecurso { MisionId = 5, RecursoId = 4, Cantidad = 5, FechaInicio = DateTime.Now.AddDays(-90) },
                // Bosque
                new UsoDeRecurso { MisionId = 7, RecursoId = 8, Cantidad = 1, FechaInicio = DateTime.Now.AddDays(-120) },
                new UsoDeRecurso { MisionId = 7, RecursoId = 4, Cantidad = 8, FechaInicio = DateTime.Now.AddDays(-120) }
            };
            
            await context.UsosDeRecurso.AddRangeAsync(usos);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {usos.Count} usos de recursos registrados");
        }

        private static async Task SeedTecnicasAplicadas(AppDbContext context)
        {
            var tecnicasAplicadas = new List<TecnicaMalditaAplicada>
            {
                // Shibuya
                new TecnicaMalditaAplicada { MisionId = 1, TecnicaMalditaId = 1, Efectividad = 98 }, // Limitless
                new TecnicaMalditaAplicada { MisionId = 1, TecnicaMalditaId = 4, Efectividad = 72 }, // Divergent Fist
                new TecnicaMalditaAplicada { MisionId = 1, TecnicaMalditaId = 5, Efectividad = 95 }, // Black Flash
                // Hospital
                new TecnicaMalditaAplicada { MisionId = 2, TecnicaMalditaId = 6, Efectividad = 80 }, // Straw Doll
                new TecnicaMalditaAplicada { MisionId = 2, TecnicaMalditaId = 9, Efectividad = 65 }, // Construction
                // Zona Industrial
                new TecnicaMalditaAplicada { MisionId = 3, TecnicaMalditaId = 7, Efectividad = 85 }, // Boogie Woogie
                new TecnicaMalditaAplicada { MisionId = 3, TecnicaMalditaId = 11, Efectividad = 88 }, // Blood Manipulation
                // Intercambio
                new TecnicaMalditaAplicada { MisionId = 5, TecnicaMalditaId = 3, Efectividad = 75 }, // Ten Shadows
                new TecnicaMalditaAplicada { MisionId = 5, TecnicaMalditaId = 8, Efectividad = 92 }, // Cursed Speech
                // Bosque
                new TecnicaMalditaAplicada { MisionId = 7, TecnicaMalditaId = 1, Efectividad = 96 } // Limitless
            };
            
            await context.TecnicaMalditaAplicada.AddRangeAsync(tecnicasAplicadas);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {tecnicasAplicadas.Count} técnicas aplicadas en misiones registradas");
        }

        private static async Task SeedSubordinaciones(AppDbContext context)
        {
            var subordinaciones = new List<Subordinacion>
            {
                // Gojo es maestro de los estudiantes de primer año
                new Subordinacion { MaestroId = 1, DiscipuloId = 2, FechaInicio = DateTime.Now.AddYears(-1), TipoRelacion = Subordinacion.ETipoRelacion.Tutoría, Activa = true }, // Gojo -> Yuji
                new Subordinacion { MaestroId = 1, DiscipuloId = 3, FechaInicio = DateTime.Now.AddYears(-1), TipoRelacion = Subordinacion.ETipoRelacion.Tutoría, Activa = true }, // Gojo -> Megumi
                new Subordinacion { MaestroId = 1, DiscipuloId = 4, FechaInicio = DateTime.Now.AddYears(-1), TipoRelacion = Subordinacion.ETipoRelacion.Tutoría, Activa = true }, // Gojo -> Nobara
                // Nanami mentor de Yuji
                new Subordinacion { MaestroId = 8, DiscipuloId = 2, FechaInicio = DateTime.Now.AddMonths(-6), TipoRelacion = Subordinacion.ETipoRelacion.Entrenamiento, Activa = true }, // Nanami -> Yuji
                // Yuta mentor de estudiantes
                new Subordinacion { MaestroId = 10, DiscipuloId = 5, FechaInicio = DateTime.Now.AddMonths(-8), TipoRelacion = Subordinacion.ETipoRelacion.Supervisión, Activa = true }, // Yuta -> Maki
                new Subordinacion { MaestroId = 10, DiscipuloId = 6, FechaInicio = DateTime.Now.AddMonths(-8), TipoRelacion = Subordinacion.ETipoRelacion.Supervisión, Activa = true }, // Yuta -> Inumaki
                new Subordinacion { MaestroId = 10, DiscipuloId = 7, FechaInicio = DateTime.Now.AddMonths(-8), TipoRelacion = Subordinacion.ETipoRelacion.Supervisión, Activa = true }  // Yuta -> Panda
            };
            
            await context.Subordinaciones.AddRangeAsync(subordinaciones);
            await context.SaveChangesAsync();
            Console.WriteLine($"✓ {subordinaciones.Count} relaciones de subordinación creadas");
        }
    }
}
