using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using GestionDeMisiones.Models;

namespace GestionDeMisiones.Web
{
    public class MaldicionesEnEstadoDocument : IDocument
    {
        private readonly IEnumerable<MaldicionEnEstado> _maldiciones;

        public MaldicionesEnEstadoDocument(IEnumerable<MaldicionEnEstado> maldiciones)
        {
            _maldiciones = maldiciones;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Text("Reporte de Maldiciones por Estado")
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
                    columns.RelativeColumn();  // Nombre
                    columns.RelativeColumn();  // Ubicación
                    columns.ConstantColumn(80); // Grado
                    columns.RelativeColumn();  // Hechicero
                });

                table.Header(header =>
                {
                    header.Cell().Text("Nombre Maldición").Bold();
                    header.Cell().Text("Ubicación").Bold();
                    header.Cell().Text("Grado").Bold();
                    header.Cell().Text("Hechicero").Bold();
                });

                foreach (var m in _maldiciones)
                {
                    table.Cell().Text(m.NombreMaldicion);
                    table.Cell().Text(m.Ubicacion);
                    table.Cell().Text(m.Grado);
                    table.Cell().Text(m.NombreHechicero);
                }
            });
        }
    }
}
