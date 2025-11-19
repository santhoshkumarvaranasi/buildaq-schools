using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class SyllabusTopic
{
    [Column("id")]
    public int Id { get; set; }

    [Column("syllabi_id")]
    public int SyllabiId { get; set; }

    [Column("title")]
    public string Title { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("sequence")]
    public int Sequence { get; set; }

    [Column("tenant_id")]
    public int TenantId { get; set; }

    public virtual Syllabus Syllabi { get; set; } = null!;

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual ICollection<TopicSchedule> TopicSchedules { get; set; } = new List<TopicSchedule>();
}
