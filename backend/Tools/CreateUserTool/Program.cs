using System;
using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace CreateUserTool
{
    // Simple console tool to insert a user into the Usuarios table.
    // Usage:
    // dotnet run --project Backend/Tools/CreateUserTool -- "Name" "email@example.com" "password" "role" "rank(optional)"
    class Program
    {
        static int Main(string[] args)
        {
            if (args.Length < 4)
            {
                Console.WriteLine("Usage: CreateUserTool <Name> <Email> <Password> <Role> [Rank]");
                return 1;
            }

            var name = args[0];
            var email = args[1];
            var password = args[2];
            var role = args[3];
            var rank = args.Length >= 5 ? args[4] : null;

            // Read connection string from appsettings.json located at Backend/appsettings.json
            var config = new ConfigurationBuilder()
                .SetBasePath(".")
                .AddJsonFile("Backend/appsettings.json")
                .Build();

            var conn = config.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(conn))
            {
                Console.WriteLine("Connection string 'DefaultConnection' not found in Backend/appsettings.json");
                return 2;
            }

            var hash = BCrypt.Net.BCrypt.HashPassword(password);

            using var connection = new SqlConnection(conn);
            connection.Open();

            var cmd = connection.CreateCommand();
            cmd.CommandType = CommandType.Text;
            cmd.CommandText = @"
INSERT INTO Usuarios (Nombre, Email, PasswordHash, Rol, Rango, CreadoEn)
VALUES (@Nombre, @Email, @PasswordHash, @Rol, @Rango, GETUTCDATE());
";
            cmd.Parameters.AddWithValue("@Nombre", name);
            cmd.Parameters.AddWithValue("@Email", email);
            cmd.Parameters.AddWithValue("@PasswordHash", hash);
            cmd.Parameters.AddWithValue("@Rol", role);
            if (rank != null)
                cmd.Parameters.AddWithValue("@Rango", rank);
            else
                cmd.Parameters.AddWithValue("@Rango", DBNull.Value);

            try
            {
                var affected = cmd.ExecuteNonQuery();
                Console.WriteLine($"User inserted. Rows affected: {affected}");
                return 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error inserting user: {ex.Message}");
                return 3;
            }
        }
    }
}
