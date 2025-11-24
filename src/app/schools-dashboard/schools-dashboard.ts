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
    feesOutstanding: 0
  };
  quickLinks = [
    { label: 'Admissions', path: 'admissions' },
    { label: 'Students', path: 'students' },
    { label: 'Attendance', path: 'attendance' },
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
    this.metrics.students = students.length;
    this.metrics.activeStudents = students.filter(s => (s.status || '').toLowerCase() === 'active').length;
    this.metrics.teachers = teachers.length;
    const today = new Date().toISOString().slice(0,10);
    this.metrics.attendanceToday = attendance.filter(a => a.date === today && a.status === 'present').length;
    this.metrics.feesOutstanding = fees.reduce((sum, f) => sum + (Number(f.balance) || 0), 0);
  }
}
