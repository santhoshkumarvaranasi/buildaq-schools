using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class Fee
{
    [Column("id")]
    public int Id { get; set; }

    [Column("tenant_id")]
    public int? TenantId { get; set; }

    [Column("class_id")]
    public int? ClassId { get; set; }

    [Column("amount")]
    public decimal Amount { get; set; }

    [Column("due_date")]
    public DateOnly? DueDate { get; set; }

    [Column("status")]
    public string? Status { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("academic_year_id")]
    public int AcademicYearId { get; set; }

    public virtual AcademicYear AcademicYear { get; set; } = null!;

    public virtual Class? Class { get; set; }

    public virtual Tenant? Tenant { get; set; }
}
