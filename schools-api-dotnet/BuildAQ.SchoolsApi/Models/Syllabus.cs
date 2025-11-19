using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class Syllabus
{
    [Column("id")]
    public int Id { get; set; }

    [Column("subject_id")]
    public int SubjectId { get; set; }

    [Column("academic_year_id")]
    public int AcademicYearId { get; set; }

    [Column("syllabus_content")]
    public string SyllabusContent { get; set; } = null!;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("tenant_id")]
    public int TenantId { get; set; }

    public virtual AcademicYear AcademicYear { get; set; } = null!;

    public virtual Subject Subject { get; set; } = null!;

    public virtual ICollection<SyllabusTopic> SyllabusTopics { get; set; } = new List<SyllabusTopic>();

    public virtual Tenant Tenant { get; set; } = null!;
}
