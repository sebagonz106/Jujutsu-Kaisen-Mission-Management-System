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
using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Configure QuestPDF license
QuestPDF.Settings.License = LicenseType.Community;

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
builder.Services.AddScoped<ISolicitudRepository, SolicitudRepository>();
builder.Services.AddScoped<IMaldicionService>(provider =>
    new MaldicionService(
        provider.GetRequiredService<IMaldicionRepository>(),
        provider.GetRequiredService<ISolicitudRepository>()
    )
);
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
builder.Services.AddScoped<IMisionService>(provider =>
    new MisionService(
        provider.GetRequiredService<IMisionRepository>(),
        provider.GetRequiredService<IUbicacionRepository>(),
        provider.GetRequiredService<ISolicitudRepository>(),
        provider.GetRequiredService<IHechiceroEnMisionRepository>(),
        provider.GetRequiredService<IHechiceroEncargadoRepository>()
    )
);
builder.Services.AddScoped<IHechiceroEnMisionRepository, HechiceroEnMisionRepository>();
builder.Services.AddScoped<IHechiceroEnMisionService, HechiceroEnMisionService>();
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
builder.Services.AddScoped<IRankingHechiceroRepository, RankingHechiceroRepository>();
builder.Services.AddScoped<IRankingHechiceroService, RankingHechiceroService>();
// Subordinacion CRUD
builder.Services.AddScoped<ISubordinacionRepository, SubordinacionRepository>();
builder.Services.AddScoped<ISubordinacionService, SubordinacionService>();
// Query services (Query2, Query4, Query6)
builder.Services.AddScoped<IQuery2Repository, Query2Repository>();
builder.Services.AddScoped<IQuery2Service, Query2Service>();
builder.Services.AddScoped<IQuery4Repository, Query4Repository>();
builder.Services.AddScoped<IQuery4Service, Query4Service>();
builder.Services.AddScoped<IQuery6Repository, Query6Repository>();
builder.Services.AddScoped<IQuery6Service, Query6Service>();
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

// Seed database - runs after app build but before run
using (var scope = app.Services.CreateScope())
{
    try
    {
        // Check if --seed argument is provided to populate entire database
        var shouldSeedAll = args.Contains("--seed");
        
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        if (shouldSeedAll)
        {
            Console.WriteLine("=== Iniciando población completa de la base de datos ===");
            await GestionDeMisiones.Data.Seed.DatabaseSeeder.SeedAllAsync(context);
            Console.WriteLine("=== Población completada exitosamente ===");
            return; // Exit after seeding
        }
        else
        {
            // Solo seed admin user para desarrollo normal
            var repo = scope.ServiceProvider.GetRequiredService<IUsuarioRepository>();
            await GestionDeMisiones.Data.Seed.AuthSeeder.SeedAdminAsync(repo);
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Seed] Error: {ex.Message}");
        Console.WriteLine($"[Seed] Stack Trace: {ex.StackTrace}");
    }
}

app.Run();


