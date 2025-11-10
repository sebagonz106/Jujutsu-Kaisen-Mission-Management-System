using Microsoft.OpenApi.Models; 
using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Data;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.IService;
using GestionDeMisiones.Repository;
using GestionDeMisiones.Service;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),sqlOptions=>sqlOptions.EnableRetryOnFailure()));
builder.Services.AddScoped<IMaldicionRepository, MaldicionRepository>();
builder.Services.AddScoped<IMaldicionService, MaldicionService>();
builder.Services.AddScoped<IHechiceroRepository, HechiceroRepository>();
builder.Services.AddScoped<IHechiceroService, HechiceroService>();
builder.Services.AddScoped<ITrasladoRepository, TrasladoRepository>();
builder.Services.AddScoped<ITrasladoService, TrasladoService>();
builder.Services.AddScoped<IHechiceroEncargadoRepository, HechiceroEncargadoRepository>();
builder.Services.AddScoped<IHechiceroEncargadoService, HechiceroEncargadoService>();
builder.Services.AddScoped<IUbicacionRepository, UbicacionRepository>();
builder.Services.AddScoped<IUbicacionService, UbicacionService>();
builder.Services.AddScoped<IUsoDeRecursoRepository, UsoDeRecursoRepository>();
builder.Services.AddScoped<IUsoDeRecursoService, UsoDeRecursoService>();
builder.Services.AddScoped<IMisionRepository, MisionRepository>();
builder.Services.AddScoped<IMisionService, MisionService>();
builder.Services.AddScoped<IPersonalDeApoyoRepository, PersonalDeApoyoRepository>();
builder.Services.AddScoped<IPersonalDeApoyoService, PersonalDeApoyoService>();
builder.Services.AddScoped<IRecursoRepository, RecursoRepository>();
builder.Services.AddScoped<IRecursoService, RecursoService>();
builder.Services.AddScoped<ISolicitudRepository, SolicitudRepository>();
builder.Services.AddScoped<ISolicitudService, SolicitudService>();
builder.Services.AddScoped<ITecnicaMalditaRepository, TecnicaMalditaRepository>();
builder.Services.AddScoped<ITecnicaMalditaService, TecnicaMalditaService>();
builder.Services.AddScoped<ITecnicaMalditaDominadaRepository, TecnicaMalditaDominadaRepository>();
builder.Services.AddScoped<ITecnicaMalditaDominadaService, TecnicaMalditaDominadaService>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();



app.MapControllers();

app.Run();


