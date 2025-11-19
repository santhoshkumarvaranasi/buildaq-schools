using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class Subject
{
    [Column("id")]
    public int Id { get; set; }

    [Column("tenant_id")]
    public int? TenantId { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("code")]
    public string? Code { get; set; }

    [Column("department_id")]
    public int? DepartmentId { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<ClassSubject> ClassSubjects { get; set; } = new List<ClassSubject>();

    public virtual Department? Department { get; set; }

    public virtual ICollection<Syllabus> Syllabi { get; set; } = new List<Syllabus>();

    public virtual Tenant? Tenant { get; set; }
}
