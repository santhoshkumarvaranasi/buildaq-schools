using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace BuildAQ.SchoolsApi.Models;

public partial class SchoolsDbContext : DbContext
{
    public SchoolsDbContext()
    {
    }

    public SchoolsDbContext(DbContextOptions<SchoolsDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AcademicYear> AcademicYears { get; set; }

    public virtual DbSet<Attendance> Attendances { get; set; }

    public virtual DbSet<Class> Classes { get; set; }

    public virtual DbSet<ClassFee> ClassFees { get; set; }

    public virtual DbSet<ClassSubject> ClassSubjects { get; set; }

    public virtual DbSet<Department> Departments { get; set; }

    public virtual DbSet<Enrollment> Enrollments { get; set; }

    public virtual DbSet<EnrollmentStatus> EnrollmentStatuses { get; set; }

    public virtual DbSet<Fee> Fees { get; set; }

    public virtual DbSet<FeeInstallment> FeeInstallments { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<RolePermission> RolePermissions { get; set; }

    public virtual DbSet<Section> Sections { get; set; }

    public virtual DbSet<StudentFee> StudentFees { get; set; }

    public virtual DbSet<Subject> Subjects { get; set; }

    public virtual DbSet<Syllabus> Syllabi { get; set; }

    public virtual DbSet<SyllabusTopic> SyllabusTopics { get; set; }

    public virtual DbSet<Tenant> Tenants { get; set; }

    public virtual DbSet<TopicFeedback> TopicFeedbacks { get; set; }

    public virtual DbSet<TopicSchedule> TopicSchedules { get; set; }

    public virtual DbSet<TopicStatus> TopicStatuses { get; set; }

    public virtual DbSet<TopicTest> TopicTests { get; set; }

    public virtual DbSet<TopicTestResult> TopicTestResults { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserStatus> UserStatuses { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Only configure the provider here if the options haven't been configured already
        // (e.g. when using the parameterless constructor or design-time tools).
        if (!optionsBuilder.IsConfigured)
        {
            // Prefer the environment variable set by ASP.NET Core configuration providers
            // for ConnectionStrings:DefaultConnection (accessed as ConnectionStrings__DefaultConnection).
            var conn = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                       ?? Environment.GetEnvironmentVariable("DEFAULT_CONNECTION");

            if (!string.IsNullOrEmpty(conn))
            {
                optionsBuilder.UseNpgsql(conn);
            }
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresExtension("pg_catalog", "azure")
            .HasPostgresExtension("pg_catalog", "pg_cron")
            .HasPostgresExtension("pg_catalog", "pgaadauth");

        modelBuilder.Entity<AcademicYear>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("academic_years_pkey");

            entity.ToTable("academic_years");

            entity.HasIndex(e => e.Name, "academic_years_name_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.IsCurrent)
                .HasDefaultValue(false)
                .HasColumnName("is_current");
            entity.Property(e => e.Name)
                .HasMaxLength(20)
                .HasColumnName("name");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
        });

        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("attendance_pkey");

            entity.ToTable("attendance");

            entity.HasIndex(e => e.TenantId, "idx_attendance_tenant");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AcademicYearId).HasColumnName("academic_year_id");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.Date).HasColumnName("date");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.TopicScheduleId).HasColumnName("topic_schedule_id");

            entity.HasOne(d => d.AcademicYear).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.AcademicYearId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("attendance_academic_year_id_fkey");

            entity.HasOne(d => d.Class).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("attendance_class_id_fkey");

            entity.HasOne(d => d.Student).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("attendance_student_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.TenantId)
                .HasConstraintName("attendance_tenant_id_fkey");

            entity.HasOne(d => d.TopicSchedule).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.TopicScheduleId)
                .HasConstraintName("attendance_topic_schedule_id_fkey");
        });

        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("classes_pkey");

            entity.ToTable("classes");

            entity.HasIndex(e => e.TenantId, "idx_classes_tenant");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AcademicYearId).HasColumnName("academic_year_id");
            entity.Property(e => e.Code)
                .HasMaxLength(50)
                .HasColumnName("code");
            entity.Property(e => e.DepartmentId).HasColumnName("department_id");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.TeacherId).HasColumnName("teacher_id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.AcademicYear).WithMany(p => p.Classes)
                .HasForeignKey(d => d.AcademicYearId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("classes_academic_year_id_fkey");

            entity.HasOne(d => d.Department).WithMany(p => p.Classes)
                .HasForeignKey(d => d.DepartmentId)
                .HasConstraintName("classes_department_id_fkey");

            entity.HasOne(d => d.Teacher).WithMany(p => p.Classes)
                .HasForeignKey(d => d.TeacherId)
                .HasConstraintName("classes_teacher_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.Classes)
                .HasForeignKey(d => d.TenantId)
                .HasConstraintName("classes_tenant_id_fkey");
        });

        modelBuilder.Entity<ClassFee>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("class_fees_pkey");

            entity.ToTable("class_fees");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AcademicYearId).HasColumnName("academic_year_id");
            entity.Property(e => e.Amount)
                .HasPrecision(10, 2)
                .HasColumnName("amount");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");

            entity.HasOne(d => d.AcademicYear).WithMany(p => p.ClassFees)
                .HasForeignKey(d => d.AcademicYearId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_class_fees_academic_year");

            entity.HasOne(d => d.Class).WithMany(p => p.ClassFees)
                .HasForeignKey(d => d.ClassId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("class_fees_class_id_fkey");
        });

        modelBuilder.Entity<ClassSubject>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("class_subjects_pkey");

            entity.ToTable("class_subjects");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.SubjectId).HasColumnName("subject_id");
            entity.Property(e => e.TeacherId).HasColumnName("teacher_id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.Class).WithMany(p => p.ClassSubjects)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("class_subjects_class_id_fkey");

            entity.HasOne(d => d.Subject).WithMany(p => p.ClassSubjects)
                .HasForeignKey(d => d.SubjectId)
                .HasConstraintName("class_subjects_subject_id_fkey");

            entity.HasOne(d => d.Teacher).WithMany(p => p.ClassSubjects)
                .HasForeignKey(d => d.TeacherId)
                .HasConstraintName("class_subjects_teacher_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.ClassSubjects)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("class_subjects_tenant_id_fkey");
        });

        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("departments_pkey");

            entity.ToTable("departments");

            entity.HasIndex(e => new { e.TenantId, e.Name }, "unique_department_per_tenant").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.HeadId).HasColumnName("head_id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.Head).WithMany(p => p.Departments)
                .HasForeignKey(d => d.HeadId)
                .HasConstraintName("departments_head_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.Departments)
                .HasForeignKey(d => d.TenantId)
                .HasConstraintName("departments_tenant_id_fkey");
        });

        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("enrollments_pkey");

            entity.ToTable("enrollments");

            entity.HasIndex(e => e.TenantId, "idx_enrollments_tenant");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AcademicYearId).HasColumnName("academic_year_id");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.EnrolledAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("enrolled_at");
            entity.Property(e => e.EnrollmentDate).HasColumnName("enrollment_date");
            entity.Property(e => e.StatusId).HasColumnName("status_id");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.AcademicYear).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.AcademicYearId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("enrollments_academic_year_id_fkey");

            entity.HasOne(d => d.Class).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("enrollments_class_id_fkey");

            entity.HasOne(d => d.Status).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_enrollment_status");

            entity.HasOne(d => d.Student).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("enrollments_student_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("enrollments_tenant_id_fkey");
        });

        modelBuilder.Entity<EnrollmentStatus>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("enrollment_status_pkey");

            entity.ToTable("enrollment_status");

            entity.HasIndex(e => e.Name, "enrollment_status_name_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(20)
                .HasColumnName("name");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.Tenant).WithMany(p => p.EnrollmentStatuses)
                .HasForeignKey(d => d.TenantId)
                .HasConstraintName("enrollment_status_tenant_id_fkey");
        });

        modelBuilder.Entity<Fee>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("fees_pkey");

            entity.ToTable("fees");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AcademicYearId).HasColumnName("academic_year_id");
            entity.Property(e => e.Amount)
                .HasPrecision(10, 2)
                .HasColumnName("amount");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.DueDate).HasColumnName("due_date");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'pending'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.AcademicYear).WithMany(p => p.Fees)
                .HasForeignKey(d => d.AcademicYearId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fees_academic_year_id_fkey");

            entity.HasOne(d => d.Class).WithMany(p => p.Fees)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("fees_class_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.Fees)
                .HasForeignKey(d => d.TenantId)
                .HasConstraintName("fees_tenant_id_fkey");
        });

        modelBuilder.Entity<FeeInstallment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("fee_installments_pkey");

            entity.ToTable("fee_installments");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Amount)
                .HasPrecision(10, 2)
                .HasColumnName("amount");
            entity.Property(e => e.DueDate).HasColumnName("due_date");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.PaidDate).HasColumnName("paid_date");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'pending'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.StudentFeeId).HasColumnName("student_fee_id");

            entity.HasOne(d => d.StudentFee).WithMany(p => p.FeeInstallments)
                .HasForeignKey(d => d.StudentFeeId)
                .HasConstraintName("fee_installments_student_fee_id_fkey");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("permissions_pkey");

            entity.ToTable("permissions");

            entity.HasIndex(e => e.Name, "permissions_name_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.Tenant).WithMany(p => p.Permissions)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("permissions_tenant_id_fkey");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("roles_pkey");

            entity.ToTable("roles");

            entity.HasIndex(e => e.Name, "roles_name_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .HasColumnName("name");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.Tenant).WithMany(p => p.Roles)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("roles_tenant_id_fkey");
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(e => new { e.RoleId, e.PermissionId }).HasName("role_permissions_pkey");

            entity.ToTable("role_permissions");

            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.PermissionId).HasColumnName("permission_id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.Permission).WithMany(p => p.RolePermissions)
                .HasForeignKey(d => d.PermissionId)
                .HasConstraintName("role_permissions_permission_id_fkey");

            entity.HasOne(d => d.Role).WithMany(p => p.RolePermissions)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("role_permissions_role_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.RolePermissions)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("role_permissions_tenant_id_fkey");
        });

        modelBuilder.Entity<Section>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("sections_pkey");

            entity.ToTable("sections");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AcademicYearId).HasColumnName("academic_year_id");
            entity.Property(e => e.Capacity)
                .HasDefaultValue(40)
                .HasColumnName("capacity");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.AcademicYear).WithMany(p => p.Sections)
                .HasForeignKey(d => d.AcademicYearId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("sections_academic_year_id_fkey");

            entity.HasOne(d => d.Class).WithMany(p => p.Sections)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("sections_class_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.Sections)
                .HasForeignKey(d => d.TenantId)
                .HasConstraintName("sections_tenant_id_fkey");
        });

        modelBuilder.Entity<StudentFee>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("student_fees_pkey");

            entity.ToTable("student_fees");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AmountPaid)
                .HasPrecision(10, 2)
                .HasColumnName("amount_paid");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Discount)
                .HasPrecision(10, 2)
                .HasDefaultValueSql("0")
                .HasColumnName("discount");
            entity.Property(e => e.FeeId).HasColumnName("fee_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'pending'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.TotalFee)
                .HasPrecision(10, 2)
                .HasColumnName("total_fee");

            entity.HasOne(d => d.Class).WithMany(p => p.StudentFees)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("student_fees_class_id_fkey");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentFees)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("student_fees_student_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.StudentFees)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("student_fees_tenant_id_fkey");
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("subjects_pkey");

            entity.ToTable("subjects");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Code)
                .HasMaxLength(50)
                .HasColumnName("code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.DepartmentId).HasColumnName("department_id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.Department).WithMany(p => p.Subjects)
                .HasForeignKey(d => d.DepartmentId)
                .HasConstraintName("subjects_department_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.Subjects)
                .HasForeignKey(d => d.TenantId)
                .HasConstraintName("subjects_tenant_id_fkey");
        });

        modelBuilder.Entity<Syllabus>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("syllabi_pkey");

            entity.ToTable("syllabi");

            entity.HasIndex(e => new { e.SubjectId, e.AcademicYearId }, "unique_subject_year").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AcademicYearId).HasColumnName("academic_year_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.SubjectId).HasColumnName("subject_id");
            entity.Property(e => e.SyllabusContent).HasColumnName("syllabus_content");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.AcademicYear).WithMany(p => p.Syllabi)
                .HasForeignKey(d => d.AcademicYearId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("syllabi_academic_year_id_fkey");

            entity.HasOne(d => d.Subject).WithMany(p => p.Syllabi)
                .HasForeignKey(d => d.SubjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("syllabi_subject_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.Syllabi)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("syllabi_tenant_id_fkey");
        });

        modelBuilder.Entity<SyllabusTopic>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("syllabus_topics_pkey");

            entity.ToTable("syllabus_topics");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Sequence).HasColumnName("sequence");
            entity.Property(e => e.SyllabiId).HasColumnName("syllabi_id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");

            entity.HasOne(d => d.Syllabi).WithMany(p => p.SyllabusTopics)
                .HasForeignKey(d => d.SyllabiId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("syllabus_topics_syllabi_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.SyllabusTopics)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("syllabus_topics_tenant_id_fkey");
        });

        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("tenants_pkey");

            entity.ToTable("tenants");

            entity.HasIndex(e => e.Domain, "tenants_domain_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Domain)
                .HasMaxLength(255)
                .HasColumnName("domain");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
        });

        modelBuilder.Entity<TopicFeedback>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("topic_feedback_pkey");

            entity.ToTable("topic_feedback");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.FeedbackText).HasColumnName("feedback_text");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.TopicScheduleId).HasColumnName("topic_schedule_id");

            entity.HasOne(d => d.Student).WithMany(p => p.TopicFeedbacks)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("topic_feedback_student_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.TopicFeedbacks)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("topic_feedback_tenant_id_fkey");

            entity.HasOne(d => d.TopicSchedule).WithMany(p => p.TopicFeedbacks)
                .HasForeignKey(d => d.TopicScheduleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("topic_feedback_topic_schedule_id_fkey");
        });

        modelBuilder.Entity<TopicSchedule>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("topic_schedule_pkey");

            entity.ToTable("topic_schedule");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AcademicYearId).HasColumnName("academic_year_id");
            entity.Property(e => e.ActualDate).HasColumnName("actual_date");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.PlannedDate).HasColumnName("planned_date");
            entity.Property(e => e.StatusId).HasColumnName("status_id");
            entity.Property(e => e.SyllabusTopicId).HasColumnName("syllabus_topic_id");
            entity.Property(e => e.TeacherId).HasColumnName("teacher_id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.AcademicYear).WithMany(p => p.TopicSchedules)
                .HasForeignKey(d => d.AcademicYearId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("topic_schedule_academic_year_id_fkey");

            entity.HasOne(d => d.Class).WithMany(p => p.TopicSchedules)
                .HasForeignKey(d => d.ClassId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("topic_schedule_class_id_fkey");

            entity.HasOne(d => d.Status).WithMany(p => p.TopicSchedules)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_topic_status");

            entity.HasOne(d => d.SyllabusTopic).WithMany(p => p.TopicSchedules)
                .HasForeignKey(d => d.SyllabusTopicId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("topic_schedule_syllabus_topic_id_fkey");

            entity.HasOne(d => d.Teacher).WithMany(p => p.TopicSchedules)
                .HasForeignKey(d => d.TeacherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("topic_schedule_teacher_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.TopicSchedules)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("topic_schedule_tenant_id_fkey");
        });

        modelBuilder.Entity<TopicStatus>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("topic_status_pkey");

            entity.ToTable("topic_status");

            entity.HasIndex(e => e.Name, "topic_status_name_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(20)
                .HasColumnName("name");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.Tenant).WithMany(p => p.TopicStatuses)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("topic_status_tenant_id_fkey");
        });

        modelBuilder.Entity<TopicTest>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("topic_tests_pkey");

            entity.ToTable("topic_tests");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.MaxScore).HasColumnName("max_score");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.TestDate).HasColumnName("test_date");
            entity.Property(e => e.TopicScheduleId).HasColumnName("topic_schedule_id");

            entity.HasOne(d => d.Tenant).WithMany(p => p.TopicTests)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("topic_tests_tenant_id_fkey");

            entity.HasOne(d => d.TopicSchedule).WithMany(p => p.TopicTests)
                .HasForeignKey(d => d.TopicScheduleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("topic_tests_topic_schedule_id_fkey");
        });

        modelBuilder.Entity<TopicTestResult>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("topic_test_results_pkey");

            entity.ToTable("topic_test_results");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Remarks).HasColumnName("remarks");
            entity.Property(e => e.Score).HasColumnName("score");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.SubmittedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("submitted_at");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");
            entity.Property(e => e.TopicTestId).HasColumnName("topic_test_id");

            entity.HasOne(d => d.Student).WithMany(p => p.TopicTestResults)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("topic_test_results_student_id_fkey");

            entity.HasOne(d => d.Tenant).WithMany(p => p.TopicTestResults)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("topic_test_results_tenant_id_fkey");

            entity.HasOne(d => d.TopicTest).WithMany(p => p.TopicTestResults)
                .HasForeignKey(d => d.TopicTestId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("topic_test_results_topic_test_id_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.TenantId, "idx_users_tenant");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AcademicInfo)
                .HasColumnType("jsonb")
                .HasColumnName("academic_info");
            entity.Property(e => e.Address)
                .HasColumnType("jsonb")
                .HasColumnName("address");
            entity.Property(e => e.Avatar)
                .HasMaxLength(255)
                .HasColumnName("avatar");
            entity.Property(e => e.Bio).HasColumnName("bio");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.DateOfBirth).HasColumnName("date_of_birth");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.EmergencyContact)
                .HasColumnType("jsonb")
                .HasColumnName("emergency_contact");
            entity.Property(e => e.EnrollmentDate).HasColumnName("enrollment_date");
            entity.Property(e => e.Experience).HasColumnName("experience");
            entity.Property(e => e.FirstName)
                .HasMaxLength(100)
                .HasColumnName("first_name");
            entity.Property(e => e.Gpa)
                .HasPrecision(3, 2)
                .HasColumnName("gpa");
            entity.Property(e => e.GradeLevel)
                .HasMaxLength(20)
                .HasColumnName("grade_level");
            entity.Property(e => e.HireDate).HasColumnName("hire_date");
            entity.Property(e => e.LastName)
                .HasMaxLength(100)
                .HasColumnName("last_name");
            entity.Property(e => e.MedicalInfo)
                .HasColumnType("jsonb")
                .HasColumnName("medical_info");
            entity.Property(e => e.Phone)
                .HasMaxLength(30)
                .HasColumnName("phone");
            entity.Property(e => e.Qualification)
                .HasMaxLength(200)
                .HasColumnName("qualification");
            entity.Property(e => e.Salary)
                .HasPrecision(12, 2)
                .HasColumnName("salary");
            entity.Property(e => e.StatusId).HasColumnName("status_id");
            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.HasOne(d => d.Status).WithMany(p => p.Users)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_user_status");

            entity.HasOne(d => d.Tenant).WithMany(p => p.Users)
                .HasForeignKey(d => d.TenantId)
                .HasConstraintName("users_tenant_id_fkey");

            entity.HasMany(d => d.Roles).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "UserRole",
                    r => r.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .HasConstraintName("user_roles_role_id_fkey"),
                    l => l.HasOne<User>().WithMany()
                        .HasForeignKey("UserId")
                        .HasConstraintName("user_roles_user_id_fkey"),
                    j =>
                    {
                        j.HasKey("UserId", "RoleId").HasName("user_roles_pkey");
                        j.ToTable("user_roles");
                        j.IndexerProperty<int>("UserId").HasColumnName("user_id");
                        j.IndexerProperty<int>("RoleId").HasColumnName("role_id");
                    });
        });

        modelBuilder.Entity<UserStatus>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_status_pkey");

            entity.ToTable("user_status");

            entity.HasIndex(e => e.Name, "user_status_name_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(20)
                .HasColumnName("name");
        });
        modelBuilder.HasSequence("jobid_seq", "cron");
        modelBuilder.HasSequence("runid_seq", "cron");

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
