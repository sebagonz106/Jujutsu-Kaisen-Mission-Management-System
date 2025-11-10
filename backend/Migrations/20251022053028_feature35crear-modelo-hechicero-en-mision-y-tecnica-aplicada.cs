using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionDeMisiones.Migrations
{
    /// <inheritdoc />
    public partial class feature35crearmodelohechiceroenmisionytecnicaaplicada : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HechiceroEnMision",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HechiceroId = table.Column<int>(type: "int", nullable: false),
                    MisionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HechiceroEnMision", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HechiceroEnMision_Hechiceros_HechiceroId",
                        column: x => x.HechiceroId,
                        principalTable: "Hechiceros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HechiceroEnMision_Misiones_MisionId",
                        column: x => x.MisionId,
                        principalTable: "Misiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TecnicaMalditaAplicada",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TecnicaMalditaId = table.Column<int>(type: "int", nullable: false),
                    MisionId = table.Column<int>(type: "int", nullable: false),
                    Efectividad = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TecnicaMalditaAplicada", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TecnicaMalditaAplicada_Misiones_MisionId",
                        column: x => x.MisionId,
                        principalTable: "Misiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TecnicaMalditaAplicada_TecnicasMalditas_TecnicaMalditaId",
                        column: x => x.TecnicaMalditaId,
                        principalTable: "TecnicasMalditas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HechiceroEnMision_HechiceroId",
                table: "HechiceroEnMision",
                column: "HechiceroId");

            migrationBuilder.CreateIndex(
                name: "IX_HechiceroEnMision_MisionId",
                table: "HechiceroEnMision",
                column: "MisionId");

            migrationBuilder.CreateIndex(
                name: "IX_TecnicaMalditaAplicada_MisionId",
                table: "TecnicaMalditaAplicada",
                column: "MisionId");

            migrationBuilder.CreateIndex(
                name: "IX_TecnicaMalditaAplicada_TecnicaMalditaId",
                table: "TecnicaMalditaAplicada",
                column: "TecnicaMalditaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HechiceroEnMision");

            migrationBuilder.DropTable(
                name: "TecnicaMalditaAplicada");
        }
    }
}
