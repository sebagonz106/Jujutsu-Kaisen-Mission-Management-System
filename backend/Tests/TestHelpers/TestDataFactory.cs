using GestionDeMisiones.Models;
using System;
using System.Collections.Generic;

namespace GestionDeMisiones.Tests.TestHelpers
{
    public static class TestDataFactory
    {
        public static Hechicero CrearHechicero(
            int id = 1,
            string nombre = "Satoru Gojo",
            Hechicero.EGrados grado = Hechicero.EGrados.especial,
            Hechicero.EEstado estado = Hechicero.EEstado.activo,
            int experiencia = 15,
            TecnicaMaldita? tecnicaPrincipal = null)
        {
            return new Hechicero
            {
                Id = id,
                Name = nombre,
                Grado = grado,
                Estado = estado,
                Experiencia = experiencia,
                TecnicaPrincipal = tecnicaPrincipal,
                Misiones = new List<HechiceroEnMision>(),
                Traslados = new List<Traslado>(),
                TecnicasMalditasDominadas = new List<TecnicaMalditaDominada>()
            };
        }

        public static Mision CrearMision(
            int id = 1,
            string eventosOcurridos = "Misión de prueba",
            Mision.EEstadoMision estado = Mision.EEstadoMision.Pendiente,
            Mision.ENivelUrgencia nivelUrgencia = Mision.ENivelUrgencia.Planificada,
            DateTime? fechaInicio = null,
            DateTime? fechaFin = null,
            Ubicacion? ubicacion = null)
        {
            var mision = new Mision
            {
                Id = id,
                EventosOcurridos = eventosOcurridos,
                Estado = estado,
                NivelUrgencia = nivelUrgencia,
                FechaYHoraDeInicio = fechaInicio ?? DateTime.Now,
                Ubicacion = ubicacion ?? CrearUbicacion(),
                UbicacionId = 1,
                UsosDeRecurso = new List<UsoDeRecurso>(),
                Traslados = new List<Traslado>(),
                Hechiceros = new List<HechiceroEnMision>(),
                Tecnicas = new List<TecnicaMalditaAplicada>(),
                DannosColaterales = "Ninguno"
            };

            if (fechaFin.HasValue)
            {
                try
                {
                    mision.SetFechaFin(fechaFin.Value);
                }
                catch (ArgumentException)
                {
                    // Si la fecha no es válida, no la establecemos
                }
            }

            return mision;
        }

        public static Ubicacion CrearUbicacion(
            int id = 1,
            string nombre = "Tokio")
        {
            return new Ubicacion
            {
                Id = id,
                Nombre = nombre,
                Misiones = new List<Mision>()
            };
        }

        public static Maldicion CrearMaldicion(
            int id = 1,
            string nombre = "Maldición de prueba",
            Maldicion.EGrado grado = Maldicion.EGrado.grado_1,
            Maldicion.ETipo tipo = Maldicion.ETipo.maligna,
            Maldicion.EEstadoActual estado = Maldicion.EEstadoActual.activa,
            Maldicion.ENivelPeligro nivelPeligro = Maldicion.ENivelPeligro.moderado,
            Ubicacion? ubicacion = null)
        {
            return new Maldicion
            {
                Id = id,
                Nombre = nombre,
                Grado = grado,
                Tipo = tipo,
                EstadoActual = estado,
                NivelPeligro = nivelPeligro,
                FechaYHoraDeAparicion = DateTime.Now,
                UbicacionDeAparicion = ubicacion ?? CrearUbicacion(2, "Shibuya")
            };
        }

        public static Solicitud CrearSolicitud(
            int id = 1,
            Maldicion? maldicion = null,
            EEstadoSolicitud estado = EEstadoSolicitud.pendiente)
        {
            return new Solicitud
            {
                Id = id,
                Maldicion = maldicion ?? CrearMaldicion(),
                Estado = estado
            };
        }

        public static TecnicaMaldita CrearTecnicaMaldita(
            int id = 1,
            string nombre = "Límite Infinito",
            TecnicaMaldita.ETipoTecnica tipo = TecnicaMaldita.ETipoTecnica.amplificacion,
            int efectividadProm = 100,
            string condiciones = "Ninguna")
        {
            return new TecnicaMaldita
            {
                Id = id,
                Nombre = nombre,
                Tipo = tipo,
                EfectividadProm = efectividadProm,
                CondicionesDeUso = condiciones,
                Misiones = new List<TecnicaMalditaAplicada>(),
                TecnicasMalditasDominadas = new List<TecnicaMalditaDominada>()
            };
        }

        public static Subordinacion CrearSubordinacion(
            int id = 1,
            int maestroId = 1,
            int discipuloId = 2,
            Subordinacion.ETipoRelacion tipo = Subordinacion.ETipoRelacion.Tutoría,
            bool activa = true,
            DateTime? fechaInicio = null,
            DateTime? fechaFin = null)
        {
            return new Subordinacion
            {
                Id = id,
                MaestroId = maestroId,
                DiscipuloId = discipuloId,
                TipoRelacion = tipo,
                Activa = activa,
                FechaInicio = fechaInicio ?? DateTime.UtcNow,
                FechaFin = fechaFin
            };
        }

        public static HechiceroEnMision CrearHechiceroEnMision(
            int id = 1,
            int hechiceroId = 1,
            int misionId = 1,
            Hechicero hechicero = null,
            Mision mision = null)
        {
            return new HechiceroEnMision
            {
                Id = id,
                HechiceroId = hechiceroId,
                MisionId = misionId,
                Hechicero = hechicero,
                Mision = mision
            };
        }

        public static TecnicaMalditaDominada CrearTecnicaMalditaDominada(
            int hechiceroId = 1,
            int tecnicaId = 1,
            float nivelDeDominio = 100f)  // Corregido: sin FechaAprendizaje
        {
            return new TecnicaMalditaDominada
            {
                HechiceroId = hechiceroId,
                TecnicaMalditaId = tecnicaId,
                NivelDeDominio = nivelDeDominio
            };
        }

        public static List<Hechicero> CrearListaHechiceros(int cantidad = 5)
        {
            var hechiceros = new List<Hechicero>();
            var nombres = new[] { "Satoru Gojo", "Nanami Kento", "Yuji Itadori", "Megumi Fushiguro", "Nobara Kugisaki" };
            var grados = new[] 
            { 
                Hechicero.EGrados.especial, 
                Hechicero.EGrados.alto, 
                Hechicero.EGrados.medio, 
                Hechicero.EGrados.medio, 
                Hechicero.EGrados.medio 
            };
            var experiencias = new[] { 15, 10, 1, 2, 1 };

            for (int i = 0; i < cantidad && i < nombres.Length; i++)
            {
                hechiceros.Add(CrearHechicero(
                    id: i + 1,
                    nombre: nombres[i],
                    grado: grados[i],
                    experiencia: experiencias[i]
                ));
            }

            return hechiceros;
        }

        public static List<Mision> CrearListaMisiones(int cantidad = 5, Ubicacion? ubicacion = null)
        {
            var misiones = new List<Mision>();
            var estados = new[] 
            { 
                Mision.EEstadoMision.Pendiente, 
                Mision.EEstadoMision.EnProgreso, 
                Mision.EEstadoMision.CompletadaConExito, 
                Mision.EEstadoMision.CompletadaConFracaso, 
                Mision.EEstadoMision.Cancelada 
            };
            var urgencias = new[] 
            { 
                Mision.ENivelUrgencia.Planificada, 
                Mision.ENivelUrgencia.Urgente, 
                Mision.ENivelUrgencia.EmergenciaCritica 
            };

            for (int i = 0; i < cantidad; i++)
            {
                var mision = CrearMision(
                    id: i + 1,
                    eventosOcurridos: $"Eventos de misión {i + 1}",
                    estado: estados[i % estados.Length],
                    nivelUrgencia: urgencias[i % urgencias.Length],
                    fechaInicio: DateTime.Now.AddDays(-i * 3),
                    fechaFin: i >= 2 ? DateTime.Now.AddDays(-i * 3 + 2) : (DateTime?)null,
                    ubicacion: ubicacion
                );

                misiones.Add(mision);
            }

            return misiones;
        }
    }
}