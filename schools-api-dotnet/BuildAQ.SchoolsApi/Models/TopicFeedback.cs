using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class TopicFeedback
{
    [Column("id")]
    public int Id { get; set; }

    [Column("topic_schedule_id")]
    public int TopicScheduleId { get; set; }

    [Column("student_id")]
    public int StudentId { get; set; }

    [Column("feedback_text")]
    public string? FeedbackText { get; set; }

    [Column("rating")]
    public int? Rating { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("tenant_id")]
    public int TenantId { get; set; }

    public virtual User Student { get; set; } = null!;

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual TopicSchedule TopicSchedule { get; set; } = null!;
}
