import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, BehaviorIncident } from '../../core/services/mock-data.service';
import { MatDialog } from '@angular/material/dialog';

interface BehaviorMetrics {
  openFollowUps: number;
  incidentsThisMonth: number;
  topCauses: { type: string; count: number }[];
}

@Component({
  selector: 'app-behavior',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./behavior.scss'],
  template: `
    <div class="behavior-page mat-typography">
      <div class="hero mat-elevation-z2">
        <div>
          <div class="eyebrow">School Management</div>
          <div class="title">Behavior</div>
        </div>
        <div class="hero-actions">
          <button mat-stroked-button color="primary" (click)="exportCsv()">Export CSV</button>
          <button mat-flat-button color="accent" (click)="openDialog()">
            <span class="icon">+</span>
            Log incident
          </button>
        </div>
      </div>

      <div class="chips">
        <mat-chip-set>
          <mat-chip color="accent" selected>
            Open follow-ups: {{ metrics.openFollowUps }}
          </mat-chip>
          <mat-chip color="primary" selected>
            Incidents this month: {{ metrics.incidentsThisMonth }}
          </mat-chip>
          <mat-chip *ngFor="let cause of metrics.topCauses">
            {{ cause.type }} ({{ cause.count }})
          </mat-chip>
        </mat-chip-set>
      </div>

      <mat-card class="filters">
        <div class="filter-grid">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="student, type, staff" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Class</mat-label>
            <mat-select [(ngModel)]="classFilter" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option *ngFor="let c of classes" [value]="c">{{ c }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Severity</mat-label>
            <mat-select [(ngModel)]="severityFilter" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="low">Low</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="high">High</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Start date</mat-label>
            <input matInput type="date" [(ngModel)]="startDate" (change)="applyFilters()" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>End date</mat-label>
            <input matInput type="date" [(ngModel)]="endDate" (change)="applyFilters()" />
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <div class="table-title">Behavior incidents</div>
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered" class="mat-elevation-z1">
            <ng-container matColumnDef="student">
              <th mat-header-cell *matHeaderCellDef>Student</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-strong">{{ row.studentName }}</div>
                <div class="cell-sub">{{ row.class }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let row">{{ row.date }}</td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let row">
                {{ row.type }}
                <mat-chip *ngIf="row.isRepeat" color="warn" selected class="chip-tight">Repeat</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="severity">
              <th mat-header-cell *matHeaderCellDef>Severity</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="severityColor(row.severity)" selected class="chip-tight">
                  {{ row.severity }}
                </mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action taken</th>
              <td mat-cell *matCellDef="let row">{{ row.actionTaken }}</td>
            </ng-container>
            <ng-container matColumnDef="staff">
              <th mat-header-cell *matHeaderCellDef>Staff</th>
              <td mat-cell *matCellDef="let row">{{ row.staff }}</td>
            </ng-container>
            <ng-container matColumnDef="followUp">
              <th mat-header-cell *matHeaderCellDef>Follow-up</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-strong">{{ row.followUpDate || '—' }}</div>
                <div class="cell-sub">
                  <mat-icon inline="true" *ngIf="row.parentNotified" aria-label="Parent notified">check_circle</mat-icon>
                  <span *ngIf="row.parentNotified">Parent notified</span>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-stroked-button color="primary" (click)="openDialog(row)">Add follow-up</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">No incidents match your filters.</td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>

    <ng-template #incidentDialog let-dialogRef>
      <h2 mat-dialog-title>Log behavior incident</h2>
      <mat-dialog-content class="dialog-content">
        <div class="dialog-grid">
          <mat-form-field appearance="outline">
            <mat-label>Student</mat-label>
            <mat-select [(ngModel)]="form.studentId">
              <mat-option *ngFor="let s of students" [value]="s.id">{{ s.firstName }} {{ s.lastName }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <input matInput [(ngModel)]="form.type" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Severity</mat-label>
            <mat-select [(ngModel)]="form.severity">
              <mat-option value="low">Low</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="high">High</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input matInput type="date" [(ngModel)]="form.date" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Follow-up date</mat-label>
            <input matInput type="date" [(ngModel)]="form.followUpDate" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Staff</mat-label>
            <mat-select [(ngModel)]="form.staff">
              <mat-option *ngFor="let t of staff" [value]="t.name">{{ t.name }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-row">
            <mat-label>Action / Notes</mat-label>
            <textarea matInput rows="3" [(ngModel)]="form.actionTaken"></textarea>
          </mat-form-field>
          <mat-checkbox [(ngModel)]="form.parentNotified">Parent notified</mat-checkbox>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">Cancel</button>
        <button mat-flat-button color="primary" (click)="save(dialogRef)" [disabled]="!form.studentId || !form.type">Save</button>
      </mat-dialog-actions>
    </ng-template>
  `
})
export class BehaviorComponent {
  @ViewChild('incidentDialog') incidentDialog!: TemplateRef<any>;

  incidents: (BehaviorIncident & { isRepeat?: boolean })[] = [];
  filtered: (BehaviorIncident & { isRepeat?: boolean })[] = [];
  displayedColumns = ['student', 'date', 'type', 'severity', 'action', 'staff', 'followUp', 'actions'];
  classes: string[] = [];
  students: any[] = [];
  staff: any[] = [];
  search = '';
  classFilter: string = 'all';
  severityFilter: 'all' | 'low' | 'medium' | 'high' = 'all';
  startDate = '';
  endDate = '';
  metrics: BehaviorMetrics = { openFollowUps: 0, incidentsThisMonth: 0, topCauses: [] };

  form: any = {};

  constructor(private mock: MockDataService, private dialog: MatDialog) {
    this.students = this.mock.getStudents();
    this.staff = this.mock.getStaff();
    this.refresh();
  }

  refresh() {
    this.incidents = this.mock.getBehaviorIncidents();
    this.classes = Array.from(new Set(this.incidents.map(i => i.class).filter(Boolean)));
    this.applyFilters();
    this.computeMetrics();
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;
    this.filtered = this.incidents.filter(i => {
      const matchesTerm = !term || [i.studentName, i.type, i.staff].some(v => (v || '').toLowerCase().includes(term));
      const matchesClass = this.classFilter === 'all' || i.class === this.classFilter;
      const matchesSeverity = this.severityFilter === 'all' || i.severity === this.severityFilter;
      const dateVal = new Date(i.date);
      const matchesStart = !start || dateVal >= start;
      const matchesEnd = !end || dateVal <= end;
      return matchesTerm && matchesClass && matchesSeverity && matchesStart && matchesEnd;
    });
  }

  computeMetrics() {
    const today = new Date();
    const monthPrefix = today.toISOString().slice(0, 7);
    this.metrics.incidentsThisMonth = this.incidents.filter(i => (i.date || '').startsWith(monthPrefix)).length;
    this.metrics.openFollowUps = this.incidents.filter(i => {
      if (!i.followUpDate) return false;
      const d = new Date(i.followUpDate);
      return d >= today;
    }).length;
    const causes: Record<string, number> = {};
    this.incidents.forEach(i => { causes[i.type] = (causes[i.type] || 0) + 1; });
    this.metrics.topCauses = Object.entries(causes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));
  }

  severityColor(sev: string) {
    if (sev === 'high') return 'warn';
    if (sev === 'medium') return 'accent';
    return 'primary';
  }

  openDialog(row?: BehaviorIncident) {
    const today = new Date().toISOString().slice(0, 10);
    this.form = {
      studentId: row?.studentId || (this.students[0]?.id ?? null),
      type: row?.type || 'General',
      severity: row?.severity || 'medium',
      date: today,
      followUpDate: row?.followUpDate || '',
      staff: row?.staff || (this.staff[0]?.name ?? ''),
      actionTaken: row?.actionTaken || ''
    };
    this.dialog.open(this.incidentDialog, { width: '520px' });
  }

  save(ref: any) {
    const student = this.students.find(s => s.id === this.form.studentId);
    this.mock.addBehaviorIncident({
      studentId: this.form.studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : undefined,
      class: student?.class,
      type: this.form.type,
      severity: this.form.severity,
      date: this.form.date,
      followUpDate: this.form.followUpDate,
      staff: this.form.staff,
      actionTaken: this.form.actionTaken || 'Logged',
      parentNotified: !!this.form.parentNotified
    });
    this.refresh();
    ref.close();
  }

  exportCsv() {
    const header = ['Student', 'Class', 'Date', 'Type', 'Severity', 'Action', 'Staff', 'FollowUp', 'ParentNotified', 'Repeat'];
    const rows = this.filtered.map(i => [
      i.studentName,
      i.class,
      i.date,
      i.type,
      i.severity,
      i.actionTaken,
      i.staff,
      i.followUpDate || '',
      i.parentNotified ? 'Yes' : 'No',
      i.isRepeat ? 'Yes' : 'No'
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'behavior-incidents.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
