using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using GestionDeMisiones.Models;

namespace GestionDeMisiones.Web
{
    public class MisionesEnRangoDocument : IDocument
    {
        private readonly IEnumerable<MisionEnRango> _misiones;

        public MisionesEnRangoDocument(IEnumerable<MisionEnRango> misiones)
        {
            _misiones = misiones;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Text("Reporte de Misiones Completadas por Rango")
                    .FontSize(18)
                    .Bold()
                    .AlignCenter();

                page.Content().PaddingVertical(10).Element(ComposeTable);

                page.Footer().AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Generado el ");
                        x.Span(DateTime.Now.ToString("dd/MM/yyyy"));
                    });
            });
        }

        void ComposeTable(IContainer container)
        {
            container.Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(40);  // ID
                    columns.RelativeColumn();   // Ubicacion
                    columns.RelativeColumn();   // Maldicion
                    columns.RelativeColumn();   // Hechiceros
                    columns.RelativeColumn();   // Tecnicas
                    columns.ConstantColumn(80); // Fecha Inicio
                    columns.ConstantColumn(80); // Fecha Fin
                });

                table.Header(header =>
                {
                    header.Cell().Text("ID").Bold();
                    header.Cell().Text("Ubicación").Bold();
                    header.Cell().Text("Maldición").Bold();
                    header.Cell().Text("Hechiceros").Bold();
                    header.Cell().Text("Técnicas").Bold();
                    header.Cell().Text("Inicio").Bold();
                    header.Cell().Text("Fin").Bold();
                });

                foreach (var m in _misiones)
                {
                    table.Cell().Text(m.MisionId.ToString());
                    table.Cell().Text(m.Ubicacion ?? "");
                    table.Cell().Text(m.Maldicion ?? "");
                    table.Cell().Text(string.Join(", ", m.Hechiceros ?? new List<string>()));
                    table.Cell().Text(string.Join(", ", m.Tecnicas ?? new List<string>()));
                    table.Cell().Text(m.FechaInicio.ToString("dd/MM/yyyy"));
                    table.Cell().Text(m.FechaFin?.ToString("dd/MM/yyyy") ?? "");
                }
            });
        }
    }
}
