using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class TopicStatus
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("tenant_id")]
    public int TenantId { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual ICollection<TopicSchedule> TopicSchedules { get; set; } = new List<TopicSchedule>();
}
