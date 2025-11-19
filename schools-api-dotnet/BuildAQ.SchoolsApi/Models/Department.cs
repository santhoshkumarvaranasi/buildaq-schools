using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class Department
{
    [Column("id")]
    public int Id { get; set; }

    [Column("tenant_id")]
    public int? TenantId { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("head_id")]
    public int? HeadId { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

    public virtual User? Head { get; set; }

    public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();

    public virtual Tenant? Tenant { get; set; }
}
