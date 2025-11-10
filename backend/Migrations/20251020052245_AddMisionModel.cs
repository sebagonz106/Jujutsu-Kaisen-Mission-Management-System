using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionDeMisiones.Migrations
{
    /// <inheritdoc />
    public partial class AddMisionModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateIndex(
                name: "IX_Misiones_UbicacionId",
                table: "Misiones",
                column: "UbicacionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Misiones");
        }
    }
}
