using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using QuestPDF.Helpers;
using GestionDeMisiones.Models;

namespace GestionDeMisiones.Web
{
    public class EfectividadTecnicasDocument : IDocument
    {
        private readonly IEnumerable<Query4Result> _data;

        public EfectividadTecnicasDocument(IEnumerable<Query4Result> data)
        {
            _data = data;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Text("Reporte de Efectividad de Técnicas de Hechiceros")
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
                    columns.RelativeColumn();   // Nombre
                    columns.RelativeColumn();   // Grado
                    columns.ConstantColumn(80); // Cantidad técnicas
                    columns.ConstantColumn(80); // Promedio
                    columns.ConstantColumn(80); // Clasificación
                });

                table.Header(header =>
                {
                    header.Cell().Text("Nombre").Bold();
                    header.Cell().Text("Grado").Bold();
                    header.Cell().Text("Cantidad").Bold();
                    header.Cell().Text("Promedio").Bold();
                    header.Cell().Text("Clasificación").Bold();
                });

                foreach (var r in _data)
                {
                    table.Cell().Text(r.NombreHechicero);
                    table.Cell().Text(r.Grado);
                    table.Cell().Text(r.CantidadTecnicas.ToString());
                    table.Cell().Text($"{r.PromedioEfectividad:F2}%");
                    table.Cell().Text(r.Clasificacion);
                }
            });
        }
    }
}
