using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionDeMisiones.Migrations
{
    /// <inheritdoc />
    public partial class restart : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Hechiceros",
                columns: table => new
                {
                    idH = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    grado = table.Column<int>(type: "int", nullable: false),
                    experiencia = table.Column<int>(type: "int", nullable: false),
                    estado = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hechiceros", x => x.idH);
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
                    NivelPeligro = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Maldiciones", x => x.Id);
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
                name: "Traslados",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    Motivo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrigenId = table.Column<int>(type: "int", nullable: false),
                    DestinoId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Traslados", x => x.Id);
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

            migrationBuilder.CreateIndex(
                name: "IX_Traslados_DestinoId",
                table: "Traslados",
                column: "DestinoId");

            migrationBuilder.CreateIndex(
                name: "IX_Traslados_OrigenId",
                table: "Traslados",
                column: "OrigenId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Hechiceros");

            migrationBuilder.DropTable(
                name: "Maldiciones");

            migrationBuilder.DropTable(
                name: "Traslados");

            migrationBuilder.DropTable(
                name: "Ubicaciones");
        }
    }
}
