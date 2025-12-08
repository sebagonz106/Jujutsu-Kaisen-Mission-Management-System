using Microsoft.OpenApi.Models; 
using Microsoft.EntityFrameworkCore;
using GestionDeMisiones.Data;
using GestionDeMisiones.IRepository;
using GestionDeMisiones.IService;
using GestionDeMisiones.IServices;
using GestionDeMisiones.Repository;
using GestionDeMisiones.Repositories;
using GestionDeMisiones.Service;
using GestionDeMisiones.Services;
using GestionDeMisiones.Conventions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Add controllers and apply a convention to version the API under /api/v1
builder.Services.AddControllers(options =>
{
    options.Conventions.Insert(0, new RoutePrefixConvention("api/v1"));
})
// Ensure consistent camelCase JSON (frontend expects camelCase keys like accessToken)
// Also serialize enums as strings (e.g., "amplificacion" instead of 0)
.AddJsonOptions(opts =>
{
    opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    opts.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});

// CORS: Allow Vite dev server (ports 5173-5175) with full headers/methods and credentials
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "https://localhost:5173",
                "https://localhost:5174",
                "https://localhost:5175"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

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
builder.Services.AddScoped<IMaldicionesEnEstadoRepository, MaldicionesEnEstadoRepository>();
builder.Services.AddScoped<IMaldicionesEnEstadosService, MaldicionesEnEstadoService>();
builder.Services.AddScoped<IMisionesEnRangoRepository, MisionesEnRangoRepository>();
builder.Services.AddScoped<IMisionesEnRangoService, MisionesEnRangoService>();
builder.Services.AddScoped<IEstadisticasHechiceroRepository, EstadisticasHechiceroRepository>();
builder.Services.AddScoped<IEstadisticasHechiceroService, EstadisticasHechiceroService>();
// Audit service
builder.Services.AddScoped<IAuditRepository, AuditRepository>();
builder.Services.AddScoped<IAuditService, AuditService>();
// Simple in-memory auth service
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Authentication & Authorization (JWT)
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection.GetValue<string>("Key") ?? "dev-key";
var jwtIssuer = jwtSection.GetValue<string>("Issuer") ?? "GestionDeMisiones";
var jwtAudience = jwtSection.GetValue<string>("Audience") ?? "GestionDeMisiones.Client";

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromMinutes(1),
            // Ensure ASP.NET maps the role claim correctly
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = "name"
        };
    });

builder.Services.AddAuthorization();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Apply CORS for frontend dev origins
app.UseCors("FrontendPolicy");

// AuthZ pipeline
app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

// Seed admin user (development only) - runs after app build but before run if scope available
using (var scope = app.Services.CreateScope())
{
    try
    {
        var repo = scope.ServiceProvider.GetRequiredService<IUsuarioRepository>();
        await GestionDeMisiones.Data.Seed.AuthSeeder.SeedAdminAsync(repo);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Seed] Error: {ex.Message}");
    }
}

app.Run();


