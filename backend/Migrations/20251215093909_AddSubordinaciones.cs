using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionDeMisiones.Migrations
{
    /// <inheritdoc />
    public partial class AddSubordinaciones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Estado",
                table: "PersonalDeApoyo");

            migrationBuilder.CreateTable(
                name: "PersonalDeApoyoTraslado",
                columns: table => new
                {
                    SupervisoresId = table.Column<int>(type: "int", nullable: false),
                    TrasladosSupervisadosId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalDeApoyoTraslado", x => new { x.SupervisoresId, x.TrasladosSupervisadosId });
                    table.ForeignKey(
                        name: "FK_PersonalDeApoyoTraslado_PersonalDeApoyo_SupervisoresId",
                        column: x => x.SupervisoresId,
                        principalTable: "PersonalDeApoyo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PersonalDeApoyoTraslado_Traslados_TrasladosSupervisadosId",
                        column: x => x.TrasladosSupervisadosId,
                        principalTable: "Traslados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Subordinaciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaestroId = table.Column<int>(type: "int", nullable: false),
                    DiscipuloId = table.Column<int>(type: "int", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TipoRelacion = table.Column<int>(type: "int", nullable: false),
                    Activa = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subordinaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Subordinaciones_Hechiceros_DiscipuloId",
                        column: x => x.DiscipuloId,
                        principalTable: "Hechiceros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Subordinaciones_Hechiceros_MaestroId",
                        column: x => x.MaestroId,
                        principalTable: "Hechiceros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PersonalDeApoyoTraslado_TrasladosSupervisadosId",
                table: "PersonalDeApoyoTraslado",
                column: "TrasladosSupervisadosId");

            migrationBuilder.CreateIndex(
                name: "IX_Subordinaciones_DiscipuloId",
                table: "Subordinaciones",
                column: "DiscipuloId");

            migrationBuilder.CreateIndex(
                name: "IX_Subordinaciones_MaestroId",
                table: "Subordinaciones",
                column: "MaestroId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PersonalDeApoyoTraslado");

            migrationBuilder.DropTable(
                name: "Subordinaciones");

            migrationBuilder.AddColumn<int>(
                name: "Estado",
                table: "PersonalDeApoyo",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
