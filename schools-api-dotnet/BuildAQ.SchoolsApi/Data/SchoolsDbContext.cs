
using Microsoft.EntityFrameworkCore;
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
            modelBuilder.Entity<UserStatus>().ToTable("user_status");
            modelBuilder.Entity<UserRole>().ToTable("user_roles");
            modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });
            // Add more mappings if you add more entities
        }
    }
}