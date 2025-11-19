using System;
using System.Collections.Generic;

namespace BuildAQ.SchoolsApi.Models;

public partial class TopicTestResult
{
    public int Id { get; set; }

    public int TopicTestId { get; set; }

    public int StudentId { get; set; }

    public int? Score { get; set; }

    public string? Remarks { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public int TenantId { get; set; }

    public virtual User Student { get; set; } = null!;

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual TopicTest TopicTest { get; set; } = null!;
}
