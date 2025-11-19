using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class UserRole
{
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("role_id")]
    public int RoleId { get; set; }

    public virtual User User { get; set; } = null!;
    public virtual Role Role { get; set; } = null!;
}
