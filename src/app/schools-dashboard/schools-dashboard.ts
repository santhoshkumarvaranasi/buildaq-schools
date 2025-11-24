import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TenantService, Tenant } from '../core/services/tenant.service';
import { MaterialModule } from '../core/material.module';
import { MockDataService } from '../core/services/mock-data.service';

@Component({
  selector: 'app-schools-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialModule],
  templateUrl: './schools-dashboard.html',
  styleUrl: './schools-dashboard.scss'
})
export class SchoolsDashboardComponent implements OnInit {
  tenant: Tenant | null = null;
  isShell = window.location.pathname.startsWith('/schools');
  metrics = {
    students: 0,
    activeStudents: 0,
    teachers: 0,
    attendanceToday: 0,
    feesOutstanding: 0,
    behaviorFollowUps: 0,
    behaviorThisMonth: 0,
    behaviorTopCauses: [] as { type: string; count: number }[]
  };
  quickLinks = [
    { label: 'Admissions', path: 'admissions' },
    { label: 'Students', path: 'students' },
    { label: 'Attendance', path: 'attendance' },
    { label: 'Behavior', path: 'behavior' },
    { label: 'Collect Fees', path: 'fees/collect' },
    { label: 'Timetable', path: 'timetable' },
    { label: 'Exams', path: 'exams' }
  ];

  constructor(private tenantService: TenantService, private mock: MockDataService) {}

  ngOnInit() {
    this.tenantService.currentTenant$.subscribe(tenant => {
      this.tenant = tenant;
    });
    this.computeMetrics();
  }

  getLink(path: string) {
    return this.isShell ? `/schools/${path}` : `/${path}`;
  }

  computeMetrics() {
    const students = this.mock.getStudents() || [];
    const teachers = this.mock.getStaff() || [];
    const attendance = this.mock.getAttendance() || [];
    const fees = this.mock.getFees() || [];
    const behavior = this.mock.getBehaviorIncidents() || [];
    this.metrics.students = students.length;
    this.metrics.activeStudents = students.filter(s => (s.status || '').toLowerCase() === 'active').length;
    this.metrics.teachers = teachers.length;
    const today = new Date().toISOString().slice(0,10);
    this.metrics.attendanceToday = attendance.filter(a => a.date === today && a.status === 'present').length;
    this.metrics.feesOutstanding = fees.reduce((sum, f) => sum + (Number(f.balance) || 0), 0);
    const monthPrefix = today.slice(0,7);
    this.metrics.behaviorThisMonth = behavior.filter(b => (b.date || '').startsWith(monthPrefix)).length;
    const now = new Date();
    this.metrics.behaviorFollowUps = behavior.filter(b => b.followUpDate && new Date(b.followUpDate) >= now).length;
    const causes: Record<string, number> = {};
    behavior.forEach(b => { causes[b.type] = (causes[b.type] || 0) + 1; });
    this.metrics.behaviorTopCauses = Object.entries(causes).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([type,count])=>({type,count}));
  }
}
