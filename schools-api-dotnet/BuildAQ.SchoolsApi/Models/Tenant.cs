using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuildAQ.SchoolsApi.Models;

public partial class Tenant
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("domain")]
    public string Domain { get; set; } = null!;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    public virtual ICollection<ClassSubject> ClassSubjects { get; set; } = new List<ClassSubject>();

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

    public virtual ICollection<Department> Departments { get; set; } = new List<Department>();

    public virtual ICollection<EnrollmentStatus> EnrollmentStatuses { get; set; } = new List<EnrollmentStatus>();

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual ICollection<Fee> Fees { get; set; } = new List<Fee>();

    public virtual ICollection<Permission> Permissions { get; set; } = new List<Permission>();

    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();

    public virtual ICollection<Section> Sections { get; set; } = new List<Section>();

    public virtual ICollection<StudentFee> StudentFees { get; set; } = new List<StudentFee>();

    public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();

    public virtual ICollection<Syllabus> Syllabi { get; set; } = new List<Syllabus>();

    public virtual ICollection<SyllabusTopic> SyllabusTopics { get; set; } = new List<SyllabusTopic>();

    public virtual ICollection<TopicFeedback> TopicFeedbacks { get; set; } = new List<TopicFeedback>();

    public virtual ICollection<TopicSchedule> TopicSchedules { get; set; } = new List<TopicSchedule>();

    public virtual ICollection<TopicStatus> TopicStatuses { get; set; } = new List<TopicStatus>();

    public virtual ICollection<TopicTestResult> TopicTestResults { get; set; } = new List<TopicTestResult>();

    public virtual ICollection<TopicTest> TopicTests { get; set; } = new List<TopicTest>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
