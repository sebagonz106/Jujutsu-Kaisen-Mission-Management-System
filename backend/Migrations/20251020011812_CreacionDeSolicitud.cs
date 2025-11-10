using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionDeMisiones.Migrations
{
    /// <inheritdoc />
    public partial class CreacionDeSolicitud : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateIndex(
                name: "IX_Solicitud_MaldicionId",
                table: "Solicitud",
                column: "MaldicionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Solicitud");
        }
    }
}
