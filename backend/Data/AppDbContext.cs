using GestionDeMisiones.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionDeMisiones.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Aquí defines tus tablas como DbSet
        public DbSet<Hechicero> Hechiceros { get; set; }

        public DbSet<Ubicacion> Ubicaciones { get; set; }

        public DbSet<Maldicion> Maldiciones { get; set; }
        public DbSet<Traslado> Traslados { get; set; }

        public DbSet<TecnicaMaldita> TecnicasMalditas { get; set; }
        public DbSet<PersonalDeApoyo> PersonalDeApoyo { get; set; } 
        public DbSet<Solicitud> Solicitud{ get; set; }
        public DbSet<Mision> Misiones { get; set; }
        public DbSet<Recurso> Recursos { get; set; }
        public DbSet<UsoDeRecurso> UsosDeRecurso { get; set; } 
        public DbSet<HechiceroEncargado>HechiceroEncargado{ get; set; }
        public DbSet<HechiceroEnMision> HechiceroEnMision { get; set; }
        public DbSet<TecnicaMalditaAplicada>TecnicaMalditaAplicada{ get; set; }

        public DbSet<TecnicaMalditaDominada> TecnicasMalditasDominadas { get; set; }

    // Usuarios (para autenticación persistente)
    public DbSet<Usuario> Usuarios { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Usuario constraints simples
            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Mision>()
                .HasOne(m => m.Ubicacion)
                .WithMany(u => u.Misiones)
                .HasForeignKey(m => m.UbicacionId);

            modelBuilder.Entity<UsoDeRecurso>()
                .HasOne(ur => ur.Mision)
                .WithMany(m => m.UsosDeRecurso)
                .HasForeignKey(ur => ur.MisionId);

            modelBuilder.Entity<UsoDeRecurso>()
                .HasOne(ur => ur.Recurso)
                .WithMany(r => r.UsosDeRecurso)
                .HasForeignKey(ur => ur.RecursoId);

            modelBuilder.Entity<Traslado>()
                .HasOne(tr => tr.Mision)
                .WithMany(m => m.Traslados)
                .HasForeignKey(tr => tr.MisionId);

            modelBuilder.Entity<Traslado>()
                .HasMany(tr => tr.Hechiceros)
                .WithMany(h => h.Traslados)
                .UsingEntity(t => t.ToTable("TrasladoDeHechicero"));
            modelBuilder.Entity<HechiceroEnMision>()
                .HasOne(hm => hm.Mision)
                .WithMany(h => h.Hechiceros)
                .HasForeignKey(hm => hm.MisionId);
            modelBuilder.Entity<HechiceroEnMision>()
                .HasOne(hm => hm.Hechicero)
                .WithMany(h => h.Misiones)
                .HasForeignKey(hm => hm.HechiceroId);
            modelBuilder.Entity<TecnicaMalditaAplicada>()
                .HasOne(tm => tm.TecnicaMaldita)
                .WithMany(t => t.Misiones)
                .HasForeignKey(tm => tm.TecnicaMalditaId);
            modelBuilder.Entity<TecnicaMalditaAplicada>()
                .HasOne(tm => tm.Mision)
                .WithMany(m => m.Tecnicas)
                .HasForeignKey(tm => tm.MisionId);

            modelBuilder.Entity<TecnicaMalditaDominada>()
                .HasOne(tmd => tmd.Hechicero)
                .WithMany(h => h.TecnicasMalditasDominadas)
                .HasForeignKey(tmd => tmd.HechiceroId);

            modelBuilder.Entity<TecnicaMalditaDominada>()
                .HasOne(tmd => tmd.TecnicaMaldita)
                .WithMany(tm => tm.TecnicasMalditasDominadas)
                .HasForeignKey(tmd => tmd.TecnicaMalditaId);

        }
    }
}
