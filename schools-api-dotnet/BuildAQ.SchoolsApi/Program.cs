
using BuildAQ.SchoolsApi.Data;
using Microsoft.EntityFrameworkCore;
using System;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Configure CORS from environment variable ALLOWED_ORIGINS (comma-separated)
var allowedOriginsEnv = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") ?? "http://localhost:4201,http://api.buildaq.com";
var allowedOrigins = allowedOriginsEnv.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToArray();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecific", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<SchoolsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseSwagger();
app.UseSwaggerUI();

// Enable CORS
app.UseCors("AllowSpecific");


app.UseHttpsRedirection();

app.MapControllers();

app.Run();
