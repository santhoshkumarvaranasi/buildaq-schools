using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class StudentFee
{
    [Column("id")]
    public int Id { get; set; }

    [Column("tenant_id")]
    public int TenantId { get; set; }

    [Column("student_id")]
    public int? StudentId { get; set; }

    [Column("class_id")]
    public int? ClassId { get; set; }

    [Column("total_fee")]
    public decimal TotalFee { get; set; }

    [Column("discount")]
    public decimal? Discount { get; set; }

    [Column("status")]
    public string? Status { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("fee_id")]
    public int? FeeId { get; set; }

    [Column("amount_paid")]
    public decimal? AmountPaid { get; set; }

    public virtual Class? Class { get; set; }

    public virtual ICollection<FeeInstallment> FeeInstallments { get; set; } = new List<FeeInstallment>();

    public virtual User? Student { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;
}
