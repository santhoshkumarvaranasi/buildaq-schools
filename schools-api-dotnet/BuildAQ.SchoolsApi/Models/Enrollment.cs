using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class Enrollment
{
    [Column("id")]
    public int Id { get; set; }

    [Column("tenant_id")]
    public int TenantId { get; set; }

    [Column("class_id")]
    public int? ClassId { get; set; }

    [Column("student_id")]
    public int? StudentId { get; set; }

    [Column("enrolled_at")]
    public DateTime? EnrolledAt { get; set; }

    [Column("enrollment_date")]
    public DateOnly? EnrollmentDate { get; set; }

    [Column("status_id")]
    public int StatusId { get; set; }

    [Column("academic_year_id")]
    public int AcademicYearId { get; set; }

    public virtual AcademicYear AcademicYear { get; set; } = null!;

    public virtual Class? Class { get; set; }

    public virtual EnrollmentStatus Status { get; set; } = null!;

    public virtual User? Student { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;
}
