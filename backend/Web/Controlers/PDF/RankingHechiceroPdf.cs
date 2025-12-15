using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using GestionDeMisiones.Models;

namespace GestionDeMisiones.Web;

public class RankingHechicerosDocument : IDocument
{
    private readonly IEnumerable<RankingHechicero> _data;

    public RankingHechicerosDocument(IEnumerable<RankingHechicero> data)
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

            page.Header().Text("Ranking de Hechiceros por Nivel de Misión")
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

    private void ComposeTable(IContainer container)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn();
                columns.RelativeColumn();
                columns.ConstantColumn(80);
                columns.ConstantColumn(80);
                columns.ConstantColumn(80);
            });

            table.Header(header =>
            {
                header.Cell().Text("Nombre").Bold();
                header.Cell().Text("Nivel Misión").Bold();
                header.Cell().Text("Total Misiones").Bold();
                header.Cell().Text("Éxitos").Bold();
                header.Cell().Text("% Éxito").Bold();
            });

            foreach (var h in _data)
            {
                table.Cell().Text(h.NombreHechicero);
                table.Cell().Text(h.NivelMision);
                table.Cell().Text(h.TotalMisiones.ToString());
                table.Cell().Text(h.MisionesExitosas.ToString());
                table.Cell().Text($"{h.PorcentajeExito:F2}%");
            }
        });
    }
}
