using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using GestionDeMisiones.Models;

namespace GestionDeMisiones.Web;
public class EfectividadHechicerosDocument : IDocument
{
    private readonly IEnumerable<EstadisticaHechicero> _data;

    public EfectividadHechicerosDocument(IEnumerable<EstadisticaHechicero> data)
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

            page.Header().Text("Reporte de Efectividad de Hechiceros")
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
                columns.RelativeColumn();
                columns.RelativeColumn();
                columns.RelativeColumn();
                columns.ConstantColumn(80);
                columns.ConstantColumn(80);
                columns.ConstantColumn(80);
            });

            table.Header(header =>
            {
                header.Cell().Text("Nombre").Bold();
                header.Cell().Text("Grado").Bold();
                header.Cell().Text("ID").Bold();
                header.Cell().Text("Total").Bold();
                header.Cell().Text("Éxitos").Bold();
                header.Cell().Text("%").Bold();
            });

            foreach (var h in _data)
            {
                table.Cell().Text(h.Nombre);
                table.Cell().Text(h.Grado);
                table.Cell().Text(h.HechiceroId.ToString());
                table.Cell().Text(h.MisionesTotales.ToString());
                table.Cell().Text(h.MisionesExitosas.ToString());
                table.Cell().Text($"{h.PorcentajeEfectividad:F2}%");
            }
        });
    }
}
