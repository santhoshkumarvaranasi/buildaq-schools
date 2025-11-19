using System;
namespace BuildAQ.SchoolsApi.Models
{
	public class TenantDepartment
	{
		public int Id { get; set; }
		public int TenantId { get; set; }
		public int DepartmentId { get; set; }
		// Add navigation properties if needed
	}
}
