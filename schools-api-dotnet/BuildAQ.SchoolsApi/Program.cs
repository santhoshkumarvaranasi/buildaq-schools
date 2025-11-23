
using BuildAQ.SchoolsApi.Data;
using Microsoft.EntityFrameworkCore;
using System;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container and configure JSON to use camelCase property names
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        // Use camelCase property names for JSON payloads
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        // Prevent System.Text.Json from throwing on reference cycles caused by EF navigation properties
        // (e.g., User -> Status -> Users -> ...). IgnoreCycles will skip serializing repeated references.
        opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        // Increase max depth to allow larger graphs if needed in dev scenarios
        opts.JsonSerializerOptions.MaxDepth = 64;
    });
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

// Configure JWT authentication (reads secret from environment variable JWT_SECRET)
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "dev-secret-change-me";
var keyBytes = Encoding.UTF8.GetBytes(jwtSecret);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
    };
});
builder.Services.AddAuthorization();

var app = builder.Build();

// When running in development, relax Kestrel's minimum request/response data rate
// to avoid BadHttpRequestException for slow or chunked proxied requests from
// local dev proxies (the dev proxy pipes request bodies and may trigger the
// MinRequestBodyDataRate enforcement). This change only applies in Development.
if (builder.Environment.IsDevelopment())
{
    builder.WebHost.ConfigureKestrel(options =>
    {
        // Disable minimum data rate checks for request and response bodies in dev
        options.Limits.MinRequestBodyDataRate = null;
        options.Limits.MinResponseDataRate = null;
    });
}

// Configure the HTTP request pipeline.

app.UseSwagger();
app.UseSwaggerUI();

// Enable CORS
app.UseCors("AllowSpecific");

// Enable authentication / authorization
app.UseAuthentication();
app.UseAuthorization();


app.UseHttpsRedirection();

app.MapControllers();

app.Run();
