using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionDeMisiones.Migrations
{
    /// <inheritdoc />
    public partial class MaldicionFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UbicacionDeAparicionId",
                table: "Maldiciones",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Maldiciones_UbicacionDeAparicionId",
                table: "Maldiciones",
                column: "UbicacionDeAparicionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Maldiciones_Ubicaciones_UbicacionDeAparicionId",
                table: "Maldiciones",
                column: "UbicacionDeAparicionId",
                principalTable: "Ubicaciones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Maldiciones_Ubicaciones_UbicacionDeAparicionId",
                table: "Maldiciones");

            migrationBuilder.DropIndex(
                name: "IX_Maldiciones_UbicacionDeAparicionId",
                table: "Maldiciones");

            migrationBuilder.DropColumn(
                name: "UbicacionDeAparicionId",
                table: "Maldiciones");
        }
    }
}
