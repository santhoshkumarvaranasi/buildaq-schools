using System;
using System.Collections.Generic;

namespace BuildAQ.SchoolsApi.Models;

public partial class UserStatus
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
