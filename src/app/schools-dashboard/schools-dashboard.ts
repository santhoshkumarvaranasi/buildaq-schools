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
    attendanceRate: 0,
    feesOutstanding: 0,
    behaviorFollowUps: 0,
    behaviorThisMonth: 0,
    behaviorTopCauses: [] as { type: string; count: number }[]
  };
  featureTiles: { icon: string; title: string; desc: string; metric: string; path: string; tone: 'blue' | 'teal' | 'gold' | 'coral' | 'violet' | 'slate' }[] = [];
  quickLinks = [
    { label: 'Add Admission', path: 'admissions' },
    { label: 'Collect Fees', path: 'fees/collect' },
    { label: 'New Announcement', path: 'announcements' },
    { label: 'Book Resource', path: 'resources' },
    { label: 'Log Incident', path: 'behavior' }
  ];
  statusChips: { label: string; icon: string; tone: 'ok' | 'warn' | 'info'; value: string }[] = [];
  upcomingEvents: { title: string; date: string; location?: string; category?: string }[] = [];

  constructor(private tenantService: TenantService, private mock: MockDataService) {}

  ngOnInit() {
    this.tenantService.currentTenant$.subscribe(tenant => {
      this.tenant = tenant;
    });
    this.computeMetrics();
    this.buildTiles();
    this.buildStatus();
    this.buildEvents();
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
    this.metrics.attendanceRate = this.metrics.students
      ? Math.round((this.metrics.attendanceToday / this.metrics.students) * 100)
      : 0;
    this.metrics.feesOutstanding = fees.reduce((sum, f) => sum + (Number(f.balance) || 0), 0);
    const monthPrefix = today.slice(0,7);
    this.metrics.behaviorThisMonth = behavior.filter(b => (b.date || '').startsWith(monthPrefix)).length;
    const now = new Date();
    this.metrics.behaviorFollowUps = behavior.filter(b => b.followUpDate && new Date(b.followUpDate) >= now).length;
    const causes: Record<string, number> = {};
    behavior.forEach(b => { causes[b.type] = (causes[b.type] || 0) + 1; });
    this.metrics.behaviorTopCauses = Object.entries(causes).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([type,count])=>({type,count}));
  }

  private buildTiles() {
    this.featureTiles = [
      { icon: '👥', title: 'Students', desc: 'Roster, status, and guardians', metric: `${this.metrics.activeStudents}/${this.metrics.students} active`, path: 'students', tone: 'blue' },
      { icon: '📅', title: 'Attendance', desc: 'Today and trends', metric: `${this.metrics.attendanceRate}% present`, path: 'attendance', tone: 'teal' },
      { icon: '💳', title: 'Fees', desc: 'Collect, discounts, receipts', metric: `$${this.metrics.feesOutstanding.toLocaleString()}`, path: 'fees/collect', tone: 'gold' },
      { icon: '⚠️', title: 'Behavior', desc: 'Incidents & follow-ups', metric: `${this.metrics.behaviorFollowUps} follow-ups`, path: 'behavior', tone: 'coral' },
      { icon: '📆', title: 'Timetable', desc: 'Conflicts and rooms', metric: 'View schedule', path: 'timetable', tone: 'violet' },
      { icon: '📊', title: 'Analytics', desc: 'Dashboards & reports', metric: 'Open reports', path: 'analytics', tone: 'slate' }
    ];
  }

  private buildStatus() {
    this.statusChips = [
      { label: 'Attendance', icon: '✅', tone: 'ok', value: `${this.metrics.attendanceRate}% today` },
      { label: 'Fees', icon: '💰', tone: 'warn', value: `$${this.metrics.feesOutstanding.toLocaleString()} due` },
      { label: 'Behavior', icon: '⚠️', tone: 'info', value: `${this.metrics.behaviorFollowUps} follow-ups` }
    ];
  }

  private buildEvents() {
    const today = new Date();
    const events = this.mock.getEvents?.() || [];
    this.upcomingEvents = events
      .filter((e: any) => new Date(e.date) >= today)
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
      .slice(0, 4);
  }
}
