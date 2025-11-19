using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class TopicSchedule
{
    [Column("id")]
    public int Id { get; set; }

    [Column("syllabus_topic_id")]
    public int SyllabusTopicId { get; set; }

    [Column("class_id")]
    public int ClassId { get; set; }

    [Column("teacher_id")]
    public int TeacherId { get; set; }

    [Column("planned_date")]
    public DateOnly? PlannedDate { get; set; }

    [Column("actual_date")]
    public DateOnly? ActualDate { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("status_id")]
    public int StatusId { get; set; }

    [Column("tenant_id")]
    public int TenantId { get; set; }

    [Column("academic_year_id")]
    public int AcademicYearId { get; set; }

    public virtual AcademicYear AcademicYear { get; set; } = null!;

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    public virtual Class Class { get; set; } = null!;

    public virtual TopicStatus Status { get; set; } = null!;

    public virtual SyllabusTopic SyllabusTopic { get; set; } = null!;

    public virtual User Teacher { get; set; } = null!;

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual ICollection<TopicFeedback> TopicFeedbacks { get; set; } = new List<TopicFeedback>();

    public virtual ICollection<TopicTest> TopicTests { get; set; } = new List<TopicTest>();
}
