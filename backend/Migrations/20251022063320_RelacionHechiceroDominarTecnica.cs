using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionDeMisiones.Migrations
{
    /// <inheritdoc />
    public partial class RelacionHechiceroDominarTecnica : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TecnicasMalditasDominadas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HechiceroId = table.Column<int>(type: "int", nullable: false),
                    TecnicaMalditaId = table.Column<int>(type: "int", nullable: false),
                    NivelDeDominio = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TecnicasMalditasDominadas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TecnicasMalditasDominadas_Hechiceros_HechiceroId",
                        column: x => x.HechiceroId,
                        principalTable: "Hechiceros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TecnicasMalditasDominadas_TecnicasMalditas_TecnicaMalditaId",
                        column: x => x.TecnicaMalditaId,
                        principalTable: "TecnicasMalditas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TecnicasMalditasDominadas_HechiceroId",
                table: "TecnicasMalditasDominadas",
                column: "HechiceroId");

            migrationBuilder.CreateIndex(
                name: "IX_TecnicasMalditasDominadas_TecnicaMalditaId",
                table: "TecnicasMalditasDominadas",
                column: "TecnicaMalditaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TecnicasMalditasDominadas");
        }
    }
}
