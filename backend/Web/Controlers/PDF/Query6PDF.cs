using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using QuestPDF.Helpers;
using GestionDeMisiones.Models;

namespace GestionDeMisiones.Web
{
    public class RelacionHechicerosDocument : IDocument
    {
        private readonly IEnumerable<Query6Result> _data;

        public RelacionHechicerosDocument(IEnumerable<Query6Result> data)
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

                page.Header().Text("Reporte de Hechiceros y Discipulos")
                    .FontSize(18)
                    .Bold()
                    .AlignCenter();

                page.Content().PaddingVertical(10).Element(ComposeTables);

                page.Footer().AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Generado el ");
                        x.Span(DateTime.Now.ToString("dd/MM/yyyy"));
                    });
            });
        }

        void ComposeTables(IContainer container)
        {
            // 1. Creamos una Columna principal para contener toda la lista
            container.Column(column =>
            {
                column.Spacing(20); // Espacio entre cada bloque de hechicero

                foreach (var hechicero in _data)
                {
                    // 2. Agregamos un Item a la columna por cada hechicero
                    column.Item().Element(c =>
                    {
                        // Aquí va tu lógica de diseño original para cada hechicero
                        // Nota: Ya no necesitamos crear otra 'Column' interna si no queremos, 
                        // pero para mantener tu estructura visual exacta, lo dejaremos similar.

                        c.Column(innerColumn =>
                        {
                            innerColumn.Item().Text($"{hechicero.NombreHechicero} ({hechicero.Grado})")
                                .Bold()
                                .FontSize(12);

                            innerColumn.Item().Text(
                                $"Misiones Totales: {hechicero.MisionesTotales}, " +
                                $"Éxitos: {hechicero.MisionesExitosas}, " +
                                $"Fallos: {hechicero.MisionesFallidas}, " +
                                $"% Éxito: {hechicero.PorcentajeExito:F2}%"
                            );

                            if (hechicero.Discipulos.Any())
                            {
                                innerColumn.Item().PaddingTop(5).Table(table =>
                                {
                                    table.ColumnsDefinition(cols =>
                                    {
                                        cols.RelativeColumn(); // Nombre
                                        cols.RelativeColumn(); // Grado
                                        cols.RelativeColumn(); // Tipo de relación
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(2).Text("Discípulo").Bold();
                                        header.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(2).Text("Grado").Bold();
                                        header.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(2).Text("Tipo Relación").Bold();
                                    });

                                    foreach (var d in hechicero.Discipulos)
                                    {
                                        table.Cell().Padding(2).Text(d.NombreDiscipulo);
                                        table.Cell().Padding(2).Text(d.GradoDiscipulo);
                                        table.Cell().Padding(2).Text(d.TipoRelacion);
                                    }
                                });
                            }
                            else
                            {
                                innerColumn.Item().PaddingTop(5).Text("No tiene discípulos asignados").Italic().FontColor(Colors.Grey.Medium);
                            }

                            innerColumn.Item().PaddingVertical(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                        });
                    });
                }
            });
        }
    }
}
