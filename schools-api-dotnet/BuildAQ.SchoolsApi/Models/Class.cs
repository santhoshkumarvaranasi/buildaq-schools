using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class Class
{
    [Column("id")]
    public int Id { get; set; }

    [Column("tenant_id")]
    public int? TenantId { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("code")]
    public string? Code { get; set; }

    [Column("teacher_id")]
    public int? TeacherId { get; set; }

    [Column("start_date")]
    public DateOnly? StartDate { get; set; }

    [Column("end_date")]
    public DateOnly? EndDate { get; set; }

    [Column("department_id")]
    public int? DepartmentId { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; }

    [Column("academic_year_id")]
    public int AcademicYearId { get; set; }

    public virtual AcademicYear AcademicYear { get; set; } = null!;

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    public virtual ICollection<ClassFee> ClassFees { get; set; } = new List<ClassFee>();

    public virtual ICollection<ClassSubject> ClassSubjects { get; set; } = new List<ClassSubject>();

    public virtual Department? Department { get; set; }

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual ICollection<Fee> Fees { get; set; } = new List<Fee>();

    public virtual ICollection<Section> Sections { get; set; } = new List<Section>();

    public virtual ICollection<StudentFee> StudentFees { get; set; } = new List<StudentFee>();

    public virtual User? Teacher { get; set; }

    public virtual Tenant? Tenant { get; set; }

    public virtual ICollection<TopicSchedule> TopicSchedules { get; set; } = new List<TopicSchedule>();
}
