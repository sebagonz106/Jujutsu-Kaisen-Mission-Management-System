using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionDeMisiones.Migrations
{
    /// <inheritdoc />
    public partial class arreglando : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PersonalDeApoyo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalDeApoyo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Recursos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TipoRecurso = table.Column<int>(type: "int", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recursos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TecnicasMalditas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tipo = table.Column<int>(type: "int", nullable: false),
                    EfectividadProm = table.Column<int>(type: "int", nullable: false),
                    CondicionesDeUso = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TecnicasMalditas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Ubicaciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ubicaciones", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Hechiceros",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Grado = table.Column<int>(type: "int", nullable: false),
                    Experiencia = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    TecnicaPrincipalId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hechiceros", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Hechiceros_TecnicasMalditas_TecnicaPrincipalId",
                        column: x => x.TecnicaPrincipalId,
                        principalTable: "TecnicasMalditas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Maldiciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaYHoraDeAparicion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Grado = table.Column<int>(type: "int", nullable: false),
                    Tipo = table.Column<int>(type: "int", nullable: false),
                    EstadoActual = table.Column<int>(type: "int", nullable: false),
                    NivelPeligro = table.Column<int>(type: "int", nullable: false),
                    UbicacionDeAparicionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Maldiciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Maldiciones_Ubicaciones_UbicacionDeAparicionId",
                        column: x => x.UbicacionDeAparicionId,
                        principalTable: "Ubicaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Misiones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FechaYHoraDeInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaYHoraDeFin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UbicacionId = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    EventosOcurridos = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DannosColaterales = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NivelUrgencia = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Misiones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Misiones_Ubicaciones_UbicacionId",
                        column: x => x.UbicacionId,
                        principalTable: "Ubicaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Solicitud",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaldicionId = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Solicitud", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Solicitud_Maldiciones_MaldicionId",
                        column: x => x.MaldicionId,
                        principalTable: "Maldiciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HechiceroEnMision",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HechiceroId = table.Column<int>(type: "int", nullable: false),
                    MisionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HechiceroEnMision", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HechiceroEnMision_Hechiceros_HechiceroId",
                        column: x => x.HechiceroId,
                        principalTable: "Hechiceros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HechiceroEnMision_Misiones_MisionId",
                        column: x => x.MisionId,
                        principalTable: "Misiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TecnicaMalditaAplicada",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TecnicaMalditaId = table.Column<int>(type: "int", nullable: false),
                    MisionId = table.Column<int>(type: "int", nullable: false),
                    Efectividad = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TecnicaMalditaAplicada", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TecnicaMalditaAplicada_Misiones_MisionId",
                        column: x => x.MisionId,
                        principalTable: "Misiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TecnicaMalditaAplicada_TecnicasMalditas_TecnicaMalditaId",
                        column: x => x.TecnicaMalditaId,
                        principalTable: "TecnicasMalditas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Traslados",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    Motivo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrigenId = table.Column<int>(type: "int", nullable: false),
                    DestinoId = table.Column<int>(type: "int", nullable: false),
                    MisionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Traslados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Traslados_Misiones_MisionId",
                        column: x => x.MisionId,
                        principalTable: "Misiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Traslados_Ubicaciones_DestinoId",
                        column: x => x.DestinoId,
                        principalTable: "Ubicaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Traslados_Ubicaciones_OrigenId",
                        column: x => x.OrigenId,
                        principalTable: "Ubicaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UsosDeRecurso",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MisionId = table.Column<int>(type: "int", nullable: false),
                    RecursoId = table.Column<int>(type: "int", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsosDeRecurso", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UsosDeRecurso_Misiones_MisionId",
                        column: x => x.MisionId,
                        principalTable: "Misiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsosDeRecurso_Recursos_RecursoId",
                        column: x => x.RecursoId,
                        principalTable: "Recursos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HechiceroEncargado",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HechiceroId = table.Column<int>(type: "int", nullable: false),
                    SolicitudId = table.Column<int>(type: "int", nullable: false),
                    MisionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HechiceroEncargado", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HechiceroEncargado_Hechiceros_HechiceroId",
                        column: x => x.HechiceroId,
                        principalTable: "Hechiceros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HechiceroEncargado_Misiones_MisionId",
                        column: x => x.MisionId,
                        principalTable: "Misiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HechiceroEncargado_Solicitud_SolicitudId",
                        column: x => x.SolicitudId,
                        principalTable: "Solicitud",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TrasladoDeHechicero",
                columns: table => new
                {
                    HechicerosId = table.Column<int>(type: "int", nullable: false),
                    TrasladosId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrasladoDeHechicero", x => new { x.HechicerosId, x.TrasladosId });
                    table.ForeignKey(
                        name: "FK_TrasladoDeHechicero_Hechiceros_HechicerosId",
                        column: x => x.HechicerosId,
                        principalTable: "Hechiceros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TrasladoDeHechicero_Traslados_TrasladosId",
                        column: x => x.TrasladosId,
                        principalTable: "Traslados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HechiceroEncargado_HechiceroId",
                table: "HechiceroEncargado",
                column: "HechiceroId");

            migrationBuilder.CreateIndex(
                name: "IX_HechiceroEncargado_MisionId",
                table: "HechiceroEncargado",
                column: "MisionId");

            migrationBuilder.CreateIndex(
                name: "IX_HechiceroEncargado_SolicitudId",
                table: "HechiceroEncargado",
                column: "SolicitudId");

            migrationBuilder.CreateIndex(
                name: "IX_HechiceroEnMision_HechiceroId",
                table: "HechiceroEnMision",
                column: "HechiceroId");

            migrationBuilder.CreateIndex(
                name: "IX_HechiceroEnMision_MisionId",
                table: "HechiceroEnMision",
                column: "MisionId");

            migrationBuilder.CreateIndex(
                name: "IX_Hechiceros_TecnicaPrincipalId",
                table: "Hechiceros",
                column: "TecnicaPrincipalId");

            migrationBuilder.CreateIndex(
                name: "IX_Maldiciones_UbicacionDeAparicionId",
                table: "Maldiciones",
                column: "UbicacionDeAparicionId");

            migrationBuilder.CreateIndex(
                name: "IX_Misiones_UbicacionId",
                table: "Misiones",
                column: "UbicacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitud_MaldicionId",
                table: "Solicitud",
                column: "MaldicionId");

            migrationBuilder.CreateIndex(
                name: "IX_TecnicaMalditaAplicada_MisionId",
                table: "TecnicaMalditaAplicada",
                column: "MisionId");

            migrationBuilder.CreateIndex(
                name: "IX_TecnicaMalditaAplicada_TecnicaMalditaId",
                table: "TecnicaMalditaAplicada",
                column: "TecnicaMalditaId");

            migrationBuilder.CreateIndex(
                name: "IX_TrasladoDeHechicero_TrasladosId",
                table: "TrasladoDeHechicero",
                column: "TrasladosId");

            migrationBuilder.CreateIndex(
                name: "IX_Traslados_DestinoId",
                table: "Traslados",
                column: "DestinoId");

            migrationBuilder.CreateIndex(
                name: "IX_Traslados_MisionId",
                table: "Traslados",
                column: "MisionId");

            migrationBuilder.CreateIndex(
                name: "IX_Traslados_OrigenId",
                table: "Traslados",
                column: "OrigenId");

            migrationBuilder.CreateIndex(
                name: "IX_UsosDeRecurso_MisionId",
                table: "UsosDeRecurso",
                column: "MisionId");

            migrationBuilder.CreateIndex(
                name: "IX_UsosDeRecurso_RecursoId",
                table: "UsosDeRecurso",
                column: "RecursoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HechiceroEncargado");

            migrationBuilder.DropTable(
                name: "HechiceroEnMision");

            migrationBuilder.DropTable(
                name: "PersonalDeApoyo");

            migrationBuilder.DropTable(
                name: "TecnicaMalditaAplicada");

            migrationBuilder.DropTable(
                name: "TrasladoDeHechicero");

            migrationBuilder.DropTable(
                name: "UsosDeRecurso");

            migrationBuilder.DropTable(
                name: "Solicitud");

            migrationBuilder.DropTable(
                name: "Hechiceros");

            migrationBuilder.DropTable(
                name: "Traslados");

            migrationBuilder.DropTable(
                name: "Recursos");

            migrationBuilder.DropTable(
                name: "Maldiciones");

            migrationBuilder.DropTable(
                name: "TecnicasMalditas");

            migrationBuilder.DropTable(
                name: "Misiones");

            migrationBuilder.DropTable(
                name: "Ubicaciones");
        }
    }
}
