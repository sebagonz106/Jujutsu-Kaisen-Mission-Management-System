using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionDeMisiones.Migrations
{
    /// <inheritdoc />
    public partial class RelacionTrasladoMision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MisionId",
                table: "Traslados",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Traslados_MisionId",
                table: "Traslados",
                column: "MisionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Traslados_Misiones_MisionId",
                table: "Traslados",
                column: "MisionId",
                principalTable: "Misiones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Traslados_Misiones_MisionId",
                table: "Traslados");

            migrationBuilder.DropIndex(
                name: "IX_Traslados_MisionId",
                table: "Traslados");

            migrationBuilder.DropColumn(
                name: "MisionId",
                table: "Traslados");
        }
    }
}
