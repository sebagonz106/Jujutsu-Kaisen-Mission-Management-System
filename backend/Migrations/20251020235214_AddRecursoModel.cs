using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionDeMisiones.Migrations
{
    /// <inheritdoc />
    public partial class AddRecursoModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Recursos");
        }
    }
}
