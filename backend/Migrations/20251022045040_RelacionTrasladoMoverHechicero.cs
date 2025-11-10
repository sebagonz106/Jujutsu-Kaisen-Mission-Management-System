using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionDeMisiones.Migrations
{
    /// <inheritdoc />
    public partial class RelacionTrasladoMoverHechicero : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                name: "IX_TrasladoDeHechicero_TrasladosId",
                table: "TrasladoDeHechicero",
                column: "TrasladosId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrasladoDeHechicero");
        }
    }
}
