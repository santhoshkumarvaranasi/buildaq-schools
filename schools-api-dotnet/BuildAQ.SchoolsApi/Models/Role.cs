using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class Role
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("tenant_id")]
    public int TenantId { get; set; }

    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
