using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class Section
{
    [Column("id")]
    public int Id { get; set; }

    [Column("tenant_id")]
    public int? TenantId { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("class_id")]
    public int? ClassId { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("capacity")]
    public int Capacity { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; }

    [Column("academic_year_id")]
    public int AcademicYearId { get; set; }

    public virtual AcademicYear AcademicYear { get; set; } = null!;

    public virtual Class? Class { get; set; }

    public virtual Tenant? Tenant { get; set; }
}
