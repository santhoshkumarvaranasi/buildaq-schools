using System;
using System.Collections.Generic;

namespace BuildAQ.SchoolsApi.Models;

public partial class TopicTest
{
    public int Id { get; set; }

    public int TopicScheduleId { get; set; }

    public DateOnly TestDate { get; set; }

    public string? Description { get; set; }

    public int? MaxScore { get; set; }

    public int TenantId { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual TopicSchedule TopicSchedule { get; set; } = null!;

    public virtual ICollection<TopicTestResult> TopicTestResults { get; set; } = new List<TopicTestResult>();
}
