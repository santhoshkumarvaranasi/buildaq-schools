using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class Attendance
{
    [Column("id")]
    public int Id { get; set; }

    [Column("tenant_id")]
    public int? TenantId { get; set; }

    [Column("class_id")]
    public int? ClassId { get; set; }

    [Column("student_id")]
    public int? StudentId { get; set; }

    [Column("date")]
    public DateOnly? Date { get; set; }

    [Column("status")]
    public string? Status { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("academic_year_id")]
    public int AcademicYearId { get; set; }

    [Column("topic_schedule_id")]
    public int? TopicScheduleId { get; set; }

    public virtual AcademicYear AcademicYear { get; set; } = null!;

    public virtual Class? Class { get; set; }

    public virtual User? Student { get; set; }

    public virtual Tenant? Tenant { get; set; }

    public virtual TopicSchedule? TopicSchedule { get; set; }
}
