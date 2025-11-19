using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class FeeInstallment
{
    [Column("id")]
    public int Id { get; set; }

    [Column("student_fee_id")]
    public int? StudentFeeId { get; set; }

    [Column("amount")]
    public decimal Amount { get; set; }

    [Column("due_date")]
    public DateOnly? DueDate { get; set; }

    [Column("paid_date")]
    public DateOnly? PaidDate { get; set; }

    [Column("status")]
    public string? Status { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    public virtual StudentFee? StudentFee { get; set; }
}
