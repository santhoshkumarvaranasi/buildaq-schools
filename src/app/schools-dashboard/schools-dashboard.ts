import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TenantService, Tenant } from '../core/services/tenant.service';
import { MaterialModule } from '../core/material.module';
import { MockDataService } from '../core/services/mock-data.service';
import { ICONS } from './icons';

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
  featureTiles: { iconKey: keyof typeof ICONS; title: string; desc: string; metric: string; path: string; tone: 'blue' | 'teal' | 'gold' | 'coral' | 'violet' | 'slate' }[] = [];
  quickLinks = [
    { label: 'Add Admission', path: 'admissions' },
    { label: 'Collect Fees', path: 'fees/collect' },
    { label: 'New Announcement', path: 'announcements' },
    { label: 'Book Resource', path: 'resources' },
    { label: 'Log Incident', path: 'behavior' }
  ];
  statusChips: { label: string; icon: string; tone: 'ok' | 'warn' | 'info'; value: string }[] = [];
  upcomingEvents: { title: string; date: string; location?: string; category?: string }[] = [];
  attendanceSpark: { date: string; rate: number }[] = [];
  feeBreakdown = { paid: 0, outstanding: 0 };
  behaviorByType: { type: string; count: number }[] = [];
  admissionsPipeline: { stage: string; count: number }[] = [];
  alerts: { label: string; detail: string; tone: 'warn' | 'info' | 'ok' }[] = [];
  recent: { label: string; detail: string; date: string }[] = [];
  safeIcons: Record<string, SafeHtml> = {};

  constructor(private tenantService: TenantService, private mock: MockDataService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.tenantService.currentTenant$.subscribe(tenant => {
      this.tenant = tenant;
    });
    this.computeMetrics();
    this.safeIcons = Object.fromEntries(Object.entries(ICONS).map(([k, v]) => [k, this.sanitizer.bypassSecurityTrustHtml(v)]));
    this.buildTiles();
    this.buildStatus();
    this.buildEvents();
    this.buildInsights();
    this.buildAlerts();
    this.buildRecent();
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
      { iconKey: 'students', title: 'Students', desc: 'Roster, status, and guardians', metric: `${this.metrics.activeStudents}/${this.metrics.students} active`, path: 'students', tone: 'blue' },
      { iconKey: 'attendance', title: 'Attendance', desc: 'Today and trends', metric: `${this.metrics.attendanceRate}% present`, path: 'attendance', tone: 'teal' },
      { iconKey: 'fees', title: 'Fees', desc: 'Collect, discounts, receipts', metric: `$${this.metrics.feesOutstanding.toLocaleString()}`, path: 'fees/collect', tone: 'gold' },
      { iconKey: 'behavior', title: 'Behavior', desc: 'Incidents & follow-ups', metric: `${this.metrics.behaviorFollowUps} follow-ups`, path: 'behavior', tone: 'coral' },
      { iconKey: 'timetable', title: 'Timetable', desc: 'Conflicts and rooms', metric: 'View schedule', path: 'timetable', tone: 'violet' },
      { iconKey: 'analytics', title: 'Analytics', desc: 'Dashboards & reports', metric: 'Open reports', path: 'analytics', tone: 'slate' }
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

  private buildInsights() {
    // Attendance sparkline: last 7 days
    const attendance = this.mock.getAttendance?.() || [];
    const byDate: Record<string, { present: number; total: number }> = {};
    attendance.forEach((a: any) => {
      if (!byDate[a.date]) byDate[a.date] = { present: 0, total: 0 };
      byDate[a.date].total += 1;
      if ((a.status || '').toLowerCase() === 'present') byDate[a.date].present += 1;
    });
    const dates = Object.keys(byDate).sort().slice(-7);
    this.attendanceSpark = dates.map(d => ({
      date: d.slice(5), // MM-DD for brevity
      rate: byDate[d].total ? Math.round((byDate[d].present / byDate[d].total) * 100) : 0
    }));

    // Fees: outstanding vs paid (paid derived from receipts)
    const fees = this.mock.getFees?.() || [];
    const receipts = this.mock.getReceipts?.() || [];
    const paid = receipts.reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0);
    const outstanding = fees.reduce((sum: number, f: any) => sum + (Number(f.balance) || 0), 0);
    this.feeBreakdown = { paid, outstanding };

    // Behavior by type
    const behavior = this.mock.getBehaviorIncidents?.() || [];
    const typeCount: Record<string, number> = {};
    behavior.forEach((b: any) => { typeCount[b.type] = (typeCount[b.type] || 0) + 1; });
    this.behaviorByType = Object.entries(typeCount).map(([type, count]) => ({ type, count })).slice(0, 4);

    // Admissions pipeline
    const admissions = this.mock.getAdmissions?.() || [];
    const stageCount: Record<string, number> = { new: 0, verified: 0, rejected: 0 };
    admissions.forEach((a: any) => { stageCount[a.status] = (stageCount[a.status] || 0) + 1; });
    this.admissionsPipeline = Object.entries(stageCount).map(([stage, count]) => ({ stage, count }));
  }

  private buildAlerts() {
    const alerts: { label: string; detail: string; tone: 'warn' | 'info' | 'ok' }[] = [];
    if (this.metrics.feesOutstanding > 0) alerts.push({ label: 'Fees due', detail: `$${this.metrics.feesOutstanding.toLocaleString()} outstanding`, tone: 'warn' });
    if (this.metrics.behaviorFollowUps > 0) alerts.push({ label: 'Behavior follow-ups', detail: `${this.metrics.behaviorFollowUps} pending`, tone: 'warn' });
    if (this.metrics.attendanceRate < 90) alerts.push({ label: 'Attendance', detail: `${this.metrics.attendanceRate}% today`, tone: 'info' });
    const upcoming = this.upcomingEvents[0];
    if (upcoming) alerts.push({ label: 'Upcoming event', detail: `${upcoming.title} on ${upcoming.date}`, tone: 'info' });
    this.alerts = alerts.slice(0, 4);
  }

  private buildRecent() {
    const recent: { label: string; detail: string; date: string }[] = [];
    const announcements = this.mock.getAnnouncements?.() || [];
    const behavior = this.mock.getBehaviorIncidents?.() || [];
    const receipts = this.mock.getReceipts?.() || [];
    announcements.slice(0,2).forEach((a: any) => recent.push({ label: 'Announcement', detail: a.title, date: a.date }));
    behavior.slice(0,2).forEach((b: any) => recent.push({ label: 'Incident', detail: `${b.studentName} - ${b.type}`, date: b.date }));
    receipts.slice(0,2).forEach((r: any) => recent.push({ label: 'Receipt', detail: `${r.studentName} $${r.amount}`, date: r.date }));
    this.recent = recent.slice(0,5);
  }

  get feePaidPercent() {
    const total = this.feeBreakdown.paid + this.feeBreakdown.outstanding;
    return total ? Math.round((this.feeBreakdown.paid / total) * 100) : 0;
  }

  get feeOutstandingPercent() {
    return 100 - this.feePaidPercent;
  }
}
