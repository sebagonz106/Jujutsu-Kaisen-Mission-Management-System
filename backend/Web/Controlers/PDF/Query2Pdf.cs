using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using QuestPDF.Helpers;
using GestionDeMisiones.Models;

namespace GestionDeMisiones.Web
{
    public class MisionesPorHechiceroDocument : IDocument
    {
        private readonly IEnumerable<Query2Result> _misiones;
        private readonly string _hechiceroNombre;

        public MisionesPorHechiceroDocument(IEnumerable<Query2Result> misiones, string hechiceroNombre)
        {
            _misiones = misiones;
            _hechiceroNombre = hechiceroNombre;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Text($"Reporte de Misiones - {_hechiceroNombre}")
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
                    columns.RelativeColumn();   // Fecha
                    columns.RelativeColumn();   // Resultado
                });

                table.Header(header =>
                {
                    header.Cell().Text("Fecha de la Misión").Bold();
                    header.Cell().Text("Resultado").Bold();
                });

                foreach (var m in _misiones)
                {
                    table.Cell().Text(m.FechaMision.ToString("dd/MM/yyyy HH:mm"));
                    table.Cell().Text(m.Resultado);
                }
            });
        }
    }
}
