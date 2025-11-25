import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../core/material.module';
import { MockDataService } from '../../core/services/mock-data.service';

type ChartPoint = { label: string; value: number; color?: string };

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  styleUrls: ['./analytics.scss'],
  template: `
    <div class="fees-page analytics-page mat-typography">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">School Management</div>
          <div class="title">Visual Analytics</div>
        </div>
      </mat-toolbar>

      <div class="charts-grid">
        <mat-card class="chart-card mat-elevation-z2">
          <mat-card-title>Students status</mat-card-title>
          <div class="bar-chart">
            <div class="bar" *ngFor="let p of studentStatus" [style.height.%]="p.value" [style.background]="p.color">
              <span class="bar-label">{{ p.label }}</span>
              <span class="bar-value">{{ p.value }}%</span>
            </div>
          </div>
        </mat-card>

        <mat-card class="chart-card mat-elevation-z2">
          <mat-card-title>Fees breakdown</mat-card-title>
          <div class="donut">
            <svg viewBox="0 0 36 36">
              <circle class="bg" cx="18" cy="18" r="15.9155"></circle>
              <ng-container *ngFor="let slice of feeSlices; let i = index">
                <circle class="slice" cx="18" cy="18" r="15.9155"
                        [attr.stroke-dasharray]="slice.dash"
                        [attr.stroke-dashoffset]="slice.offset"
                        [attr.stroke]="slice.color"></circle>
              </ng-container>
            </svg>
            <div class="donut-legend">
              <div *ngFor="let s of feeLegend" class="legend-row">
                <span class="legend-dot" [style.background]="s.color"></span>
                <span>{{ s.label }}</span>
                <span class="legend-value">{{ s.value | currency }}</span>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="chart-card mat-elevation-z2">
          <mat-card-title>Attendance today</mat-card-title>
          <div class="gauge">
            <svg viewBox="0 0 36 18">
              <path class="gauge-bg" d="M2 18 A16 16 0 0 1 34 18"></path>
              <path class="gauge-fill" [attr.d]="gaugePath" stroke-linecap="round"></path>
            </svg>
            <div class="gauge-value">{{ attendanceRate }}%</div>
          </div>
        </mat-card>

        <mat-card class="chart-card mat-elevation-z2">
          <mat-card-title>Incidents by type</mat-card-title>
          <div class="bar-chart horizontal">
            <div class="bar horizontal" *ngFor="let p of incidentTypes" [style.width.%]="p.value" [style.background]="p.color">
              <span class="bar-label">{{ p.label }}</span>
              <span class="bar-value">{{ p.value }}</span>
            </div>
          </div>
        </mat-card>

        <mat-card class="chart-card mat-elevation-z2">
          <mat-card-title>Exam averages</mat-card-title>
          <div class="bar-chart">
            <div class="bar" *ngFor="let p of examAverages" [style.height.%]="p.value" [style.background]="p.color">
              <span class="bar-label">{{ p.label }}</span>
              <span class="bar-value">{{ p.value }}%</span>
            </div>
          </div>
        </mat-card>

        <mat-card class="chart-card mat-elevation-z2">
          <mat-card-title>PD hours by teacher</mat-card-title>
          <div class="bar-chart horizontal">
            <div class="bar horizontal" *ngFor="let p of pdHours" [style.width.%]="p.value" [style.background]="p.color">
              <span class="bar-label">{{ p.label }}</span>
              <span class="bar-value">{{ p.value }}h</span>
            </div>
          </div>
        </mat-card>

        <mat-card class="chart-card mat-elevation-z2">
          <mat-card-title>Resource status</mat-card-title>
          <div class="bar-chart horizontal">
            <div class="bar horizontal" *ngFor="let p of resourceStatus" [style.width.%]="p.value" [style.background]="p.color">
              <span class="bar-label">{{ p.label }}</span>
              <span class="bar-value">{{ p.count }}</span>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `
})
export class AnalyticsComponent {
  studentStatus: ChartPoint[] = [];
  feeSlices: { dash: string; offset: string; color: string }[] = [];
  feeLegend: ChartPoint[] = [];
  attendanceRate = 0;
  incidentTypes: ChartPoint[] = [];
  examAverages: ChartPoint[] = [];
  gaugePath = '';
  pdHours: (ChartPoint & { value: number })[] = [];
  resourceStatus: (ChartPoint & { count: number })[] = [];

  constructor(private mock: MockDataService) {
    this.computeStudentStatus();
    this.computeFees();
    this.computeAttendance();
    this.computeIncidents();
    this.computeExams();
    this.computePd();
    this.computeResources();
    this.buildGauge();
  }

  private computeStudentStatus() {
    const students = this.mock.getStudents();
    const total = students.length || 1;
    const active = students.filter(s => (s.status || '').toLowerCase() === 'active').length;
    const inactive = total - active;
    this.studentStatus = [
      { label: 'Active', value: Math.round((active / total) * 100), color: '#4ade80' },
      { label: 'Inactive', value: Math.round((inactive / total) * 100), color: '#f97316' }
    ];
  }

  private computeFees() {
    const fees = this.mock.getFees();
    const total = fees.reduce((s, f) => s + (Number(f.balance) || 0), 0);
    const cleared = fees.filter(f => (f.balance || 0) === 0).length;
    const due = fees.length - cleared;
    this.feeLegend = [
      { label: 'Outstanding', value: total, color: '#6366f1' },
      { label: 'Cleared', value: cleared, color: '#22c55e' },
      { label: 'Due count', value: due, color: '#f97316' }
    ];
    const sum = this.feeLegend.reduce((s, l) => s + (Number(l.value) || 0), 0) || 1;
    let offset = 25;
    this.feeSlices = this.feeLegend.map(l => {
      const pct = Math.max(1, Math.round(((Number(l.value) || 0) / sum) * 100));
      const dash = `${pct} ${100 - pct}`;
      const slice = { dash, offset: `${offset}`, color: l.color as string };
      offset -= pct;
      return slice;
    });
  }

  private computeAttendance() {
    const attendance = this.mock.getAttendance();
    const today = new Date().toISOString().slice(0, 10);
    const todays = attendance.filter(a => a.date === today);
    const present = todays.filter(a => a.status === 'present').length;
    const total = todays.length || 1;
    this.attendanceRate = Math.round((present / total) * 100);
  }

  private computeIncidents() {
    const incidents = this.mock.getBehaviorIncidents?.() || [];
    const counts: Record<string, number> = {};
    incidents.forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1; });
    this.incidentTypes = Object.entries(counts).map(([k, v], idx) => ({
      label: k,
      value: v,
      color: ['#f97316', '#22c55e', '#6366f1', '#eab308'][idx % 4]
    }));
  }

  private computeExams() {
    const exams = this.mock.getExams();
    this.examAverages = exams.map((e, idx) => {
      const marks = e.studentMarks || [];
      const avg = marks.length ? Math.round(marks.reduce((s: number, m: any) => s + (m.marks || 0), 0) / marks.length) : 0;
      return { label: e.title || `Exam ${idx + 1}`, value: avg, color: ['#6366f1', '#22c55e', '#f97316'][idx % 3] };
    });
  }

  private computePd() {
    const pd = this.mock.getTeacherPd?.() || [];
    this.pdHours = pd.map((p, idx) => ({
      label: p.teacherName || `Teacher ${idx + 1}`,
      value: p.hours || 0,
      color: ['#10b981', '#3b82f6', '#a855f7', '#f97316'][idx % 4]
    }));
  }

  private computeResources() {
    const resources = this.mock.getResources?.() || [];
    const statusCount: Record<string, number> = {};
    resources.forEach(r => { statusCount[r.status || 'available'] = (statusCount[r.status || 'available'] || 0) + 1; });
    const total = resources.length || 1;
    const colors = { 'available': '#22c55e', 'in-use': '#3b82f6', 'maintenance': '#f97316' } as any;
    this.resourceStatus = Object.entries(statusCount).map(([label, count]) => ({
      label,
      count,
      value: Math.round((count / total) * 100),
      color: colors[label] || '#6b7280'
    }));
  }

  private buildGauge() {
    const pct = Math.min(100, Math.max(0, this.attendanceRate));
    const endAngle = (pct / 100) * Math.PI;
    const x = 18 + 16 * Math.cos(Math.PI - endAngle);
    const y = 18 - 16 * Math.sin(Math.PI - endAngle);
    const largeArc = pct > 50 ? 1 : 0;
    this.gaugePath = `M2 18 A16 16 0 ${largeArc} 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
}
