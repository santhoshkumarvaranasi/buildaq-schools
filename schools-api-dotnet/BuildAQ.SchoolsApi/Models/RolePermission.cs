using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class RolePermission
{
    [Column("role_id")]
    public int RoleId { get; set; }

    [Column("permission_id")]
    public int PermissionId { get; set; }

    [Column("tenant_id")]
    public int TenantId { get; set; }

    public virtual Permission Permission { get; set; } = null!;

    public virtual Role Role { get; set; } = null!;

    public virtual Tenant Tenant { get; set; } = null!;
}
