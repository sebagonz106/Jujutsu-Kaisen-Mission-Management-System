using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionDeMisiones.Migrations
{
    /// <inheritdoc />
    public partial class CreacionDeHechiceroEncargado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HechiceroEncargado");
        }
    }
}
