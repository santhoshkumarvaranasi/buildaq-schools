using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class ClassSubject
{
    [Column("id")]
    public int Id { get; set; }

    [Column("class_id")]
    public int? ClassId { get; set; }

    [Column("subject_id")]
    public int? SubjectId { get; set; }

    [Column("teacher_id")]
    public int? TeacherId { get; set; }

    [Column("tenant_id")]
    public int TenantId { get; set; }

    public virtual Class? Class { get; set; }

    public virtual Subject? Subject { get; set; }

    public virtual User? Teacher { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;
}
