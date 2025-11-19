
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using System.Text.RegularExpressions;
using BuildAQ.SchoolsApi.Models;

// Map Id property to id column for all entities
// (This block must be inside OnModelCreating, after base.OnModelCreating)

namespace BuildAQ.SchoolsApi.Data
{
    public class SchoolsDbContext : DbContext
    {
        public SchoolsDbContext(DbContextOptions<SchoolsDbContext> options) : base(options) { }

        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Syllabus> Syllabi { get; set; }
        public DbSet<TenantDepartment> TenantDepartments { get; set; }
        public DbSet<TopicFeedback> TopicFeedbacks { get; set; }
        public DbSet<AcademicYear> AcademicYears { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<ClassFee> ClassFees { get; set; }
        public DbSet<ClassSubject> ClassSubjects { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<EnrollmentStatus> EnrollmentStatuses { get; set; }
        public DbSet<Fee> Fees { get; set; }
        public DbSet<FeeInstallment> FeeInstallments { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<Section> Sections { get; set; }
        public DbSet<StudentFee> StudentFees { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<SyllabusTopic> SyllabusTopics { get; set; }
        public DbSet<TopicSchedule> TopicSchedules { get; set; }
        public DbSet<TopicStatus> TopicStatuses { get; set; }
        public DbSet<TopicTest> TopicTests { get; set; }
        public DbSet<TopicTestResult> TopicTestResults { get; set; }
        public DbSet<UserStatus> UserStatuses { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Ensure properties use snake_case column names to match existing PostgreSQL schema.
            // Map 'Id' -> 'id' and generally convert PascalCase property names to snake_case column names.
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var prop in entityType.GetProperties())
                {
                    // If the property already has an explicit column name from [Column], respect it.
                    var currentName = prop.GetColumnName(StoreObjectIdentifier.Table(entityType.GetTableName(), entityType.GetSchema()));
                    if (!string.IsNullOrEmpty(currentName)) continue;

                    var clrName = prop.Name;
                    if (string.Equals(clrName, "Id", StringComparison.OrdinalIgnoreCase))
                    {
                        prop.SetColumnName("id");
                        continue;
                    }

                    // convert PascalCase to snake_case
                    var snake = Regex.Replace(clrName, "([a-z0-9])([A-Z])", "$1_$2").ToLowerInvariant();
                    prop.SetColumnName(snake);
                }
            }
            // Define composite primary key for RolePermission
            modelBuilder.Entity<RolePermission>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId, rp.TenantId });

            // Map C# entity names to PostgreSQL snake_case table names
            modelBuilder.Entity<AcademicYear>().ToTable("academic_years");
            modelBuilder.Entity<Attendance>().ToTable("attendance");
            modelBuilder.Entity<Class>().ToTable("classes");
            modelBuilder.Entity<ClassFee>().ToTable("class_fees");
            modelBuilder.Entity<ClassSubject>().ToTable("class_subjects");
            modelBuilder.Entity<Department>().ToTable("departments");
            modelBuilder.Entity<Enrollment>().ToTable("enrollments");
            modelBuilder.Entity<EnrollmentStatus>().ToTable("enrollment_status");
            modelBuilder.Entity<Fee>().ToTable("fees");
            modelBuilder.Entity<FeeInstallment>().ToTable("fee_installments");
            modelBuilder.Entity<Permission>().ToTable("permissions");
            modelBuilder.Entity<Role>().ToTable("roles");
            modelBuilder.Entity<RolePermission>().ToTable("role_permissions");
            modelBuilder.Entity<Section>().ToTable("sections");
            modelBuilder.Entity<StudentFee>().ToTable("student_fees");
            modelBuilder.Entity<Subject>().ToTable("subjects");
            modelBuilder.Entity<Syllabus>().ToTable("syllabi");
            modelBuilder.Entity<SyllabusTopic>().ToTable("syllabus_topics");
            modelBuilder.Entity<Tenant>().ToTable("tenants");
            modelBuilder.Entity<TenantDepartment>().ToTable("tenant_departments");
            modelBuilder.Entity<TopicFeedback>().ToTable("topic_feedback");
            modelBuilder.Entity<TopicSchedule>().ToTable("topic_schedule");
            modelBuilder.Entity<TopicStatus>().ToTable("topic_status");
            modelBuilder.Entity<TopicTest>().ToTable("topic_tests");
            modelBuilder.Entity<TopicTestResult>().ToTable("topic_test_results");
            modelBuilder.Entity<User>().ToTable("users");
            // Configure explicit many-to-many via the join entity UserRole to avoid EF creating an implicit join table
            modelBuilder.Entity<User>()
                .HasMany(u => u.Roles)
                .WithMany(r => r.Users)
                .UsingEntity<UserRole>(
                    j => j
                        .HasOne(ur => ur.Role)
                        .WithMany()
                        .HasForeignKey(ur => ur.RoleId),
                    j => j
                        .HasOne(ur => ur.User)
                        .WithMany()
                        .HasForeignKey(ur => ur.UserId),
                    j =>
                    {
                        j.ToTable("user_roles");
                        j.HasKey(ur => new { ur.UserId, ur.RoleId });
                        j.Property(ur => ur.UserId).HasColumnName("user_id");
                        j.Property(ur => ur.RoleId).HasColumnName("role_id");
                    }
                );
            modelBuilder.Entity<UserStatus>(b =>
            {
                b.ToTable("user_status");
                b.Property(u => u.Id).HasColumnName("id");
                b.Property(u => u.Name).HasColumnName("name");
            });
            modelBuilder.Entity<UserRole>().ToTable("user_roles");
            modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });
            // Add more mappings if you add more entities
        }
    }
}