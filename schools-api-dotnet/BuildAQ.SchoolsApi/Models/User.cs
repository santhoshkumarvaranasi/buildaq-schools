using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace BuildAQ.SchoolsApi.Models;

public partial class User
{
    [Column("id")]
    public int Id { get; set; }

    [Column("tenant_id")]
    public int? TenantId { get; set; }

    [Column("email")]
    public string Email { get; set; } = null!;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("first_name")]
    public string? FirstName { get; set; }

    [Column("last_name")]
    public string? LastName { get; set; }

    [Column("phone")]
    public string? Phone { get; set; }

    [Column("address")]
    public string? Address { get; set; }

    [Column("date_of_birth")]
    public DateTime? DateOfBirth { get; set; }

    [Column("enrollment_date")]
    public DateTime? EnrollmentDate { get; set; }

    [Column("grade_level")]
    public string? GradeLevel { get; set; }

    [Column("gpa")]
    public decimal? Gpa { get; set; }

    [Column("emergency_contact")]
    public string? EmergencyContact { get; set; }

    [Column("medical_info")]
    public string? MedicalInfo { get; set; }

    [Column("academic_info", TypeName = "jsonb")]
    public JsonDocument? AcademicInfo { get; set; }

    [Column("qualification")]
    public string? Qualification { get; set; }

    [Column("experience")]
    public int? Experience { get; set; }

    [Column("hire_date")]
    public DateTime? HireDate { get; set; }

    [Column("salary")]
    public decimal? Salary { get; set; }

    [Column("avatar")]
    public string? Avatar { get; set; }

    [Column("bio")]
    public string? Bio { get; set; }

    [Column("status_id")]
    public int StatusId { get; set; }

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public virtual ICollection<ClassSubject> ClassSubjects { get; set; } = new List<ClassSubject>();
    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();
    public virtual ICollection<Department> Departments { get; set; } = new List<Department>();
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual UserStatus Status { get; set; } = null!;

    public virtual ICollection<StudentFee> StudentFees { get; set; } = new List<StudentFee>();

    public virtual Tenant? Tenant { get; set; }

    public virtual ICollection<TopicFeedback> TopicFeedbacks { get; set; } = new List<TopicFeedback>();

    public virtual ICollection<TopicSchedule> TopicSchedules { get; set; } = new List<TopicSchedule>();

    public virtual ICollection<TopicTestResult> TopicTestResults { get; set; } = new List<TopicTestResult>();

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
