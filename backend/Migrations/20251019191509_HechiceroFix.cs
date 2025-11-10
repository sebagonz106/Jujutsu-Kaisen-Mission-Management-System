using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionDeMisiones.Migrations
{
    /// <inheritdoc />
    public partial class HechiceroFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "name",
                table: "Hechiceros",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "grado",
                table: "Hechiceros",
                newName: "Grado");

            migrationBuilder.RenameColumn(
                name: "experiencia",
                table: "Hechiceros",
                newName: "Experiencia");

            migrationBuilder.RenameColumn(
                name: "estado",
                table: "Hechiceros",
                newName: "Estado");

            migrationBuilder.RenameColumn(
                name: "idH",
                table: "Hechiceros",
                newName: "Id");

            migrationBuilder.AddColumn<int>(
                name: "TecnicaPrincipalId",
                table: "Hechiceros",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Hechiceros_TecnicaPrincipalId",
                table: "Hechiceros",
                column: "TecnicaPrincipalId");

            migrationBuilder.AddForeignKey(
                name: "FK_Hechiceros_TecnicasMalditas_TecnicaPrincipalId",
                table: "Hechiceros",
                column: "TecnicaPrincipalId",
                principalTable: "TecnicasMalditas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Hechiceros_TecnicasMalditas_TecnicaPrincipalId",
                table: "Hechiceros");

            migrationBuilder.DropIndex(
                name: "IX_Hechiceros_TecnicaPrincipalId",
                table: "Hechiceros");

            migrationBuilder.DropColumn(
                name: "TecnicaPrincipalId",
                table: "Hechiceros");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Hechiceros",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Grado",
                table: "Hechiceros",
                newName: "grado");

            migrationBuilder.RenameColumn(
                name: "Experiencia",
                table: "Hechiceros",
                newName: "experiencia");

            migrationBuilder.RenameColumn(
                name: "Estado",
                table: "Hechiceros",
                newName: "estado");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Hechiceros",
                newName: "idH");
        }
    }
}
