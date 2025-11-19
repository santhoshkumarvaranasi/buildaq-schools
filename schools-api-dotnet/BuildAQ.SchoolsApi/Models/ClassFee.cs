using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class ClassFee
{
    [Column("id")]
    public int Id { get; set; }

    [Column("class_id")]
    public int ClassId { get; set; }

    [Column("amount")]
    public decimal Amount { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("academic_year_id")]
    public int AcademicYearId { get; set; }

    public virtual AcademicYear AcademicYear { get; set; } = null!;

    public virtual Class Class { get; set; } = null!;
}
