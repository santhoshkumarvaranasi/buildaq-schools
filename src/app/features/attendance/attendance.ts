import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { MaterialModule } from '../../core/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

type AttendanceRow = {
  id: number;
  studentId: number;
  studentName: string;
  class?: string;
  date: string;
  status: 'present' | 'absent';
};

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['../fees/fees.scss','./attendance.scss'],
  template: `
    <div class="fees-page attendance-page">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">School Management</div>
          <div class="title">Attendance</div>
        </div>
      </mat-toolbar>

      <div class="summary-grid">
        <mat-card class="metric-card mat-elevation-z2">
          <div class="metric-icon success">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm-2 15-4-4 1.4-1.4 2.6 2.6 5.6-5.6L17 10l-7 7z" fill="currentColor"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-label">Present today</div>
            <div class="metric-value">{{ summary.present }}</div>
            <div class="metric-hint">Out of {{ summary.total }} students</div>
          </div>
        </mat-card>

        <mat-card class="metric-card mat-elevation-z2">
          <div class="metric-icon warn">
            <svg class="icon" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V8h2v6z" fill="currentColor"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-label">Absent</div>
            <div class="metric-value warn-text">{{ summary.absent }}</div>
            <div class="metric-hint">Tracked for {{ today }}</div>
          </div>
        </mat-card>

        <mat-card class="metric-card mat-elevation-z2">
          <div class="metric-icon">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 8v5h4v-2h-2V8z" fill="currentColor"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" fill="currentColor"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-label">Marked</div>
            <div class="metric-value">{{ attendance.length }}</div>
            <div class="metric-hint">Entries recorded</div>
          </div>
        </mat-card>
      </div>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill" class="full-width search-field">
            <mat-label>Search student</mat-label>
            <span matPrefix class="icon-wrap">
              <svg class="icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28h.79l5 4.99L20.49 19l-5-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg>
            </span>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="name or id" />
            <button *ngIf="search" matSuffix mat-icon-button aria-label="Clear search" (click)="clearSearch()">
              <svg class="icon" viewBox="0 0 24 24"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L12 13.41l-4.89 4.9-1.41-1.42L10.59 12 4.29 5.71 5.7 4.29 12 10.59l6.29-6.3z" fill="currentColor"/></svg>
            </button>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Date</mat-label>
            <input matInput type="date" [(ngModel)]="newDate" (ngModelChange)="applyFilters()" />
          </mat-form-field>

          <mat-chip-listbox class="status-chips" [value]="statusFilter" (selectionChange)="onStatusChange($event)">
            <mat-chip-option value="all">All</mat-chip-option>
            <mat-chip-option value="present">Present</mat-chip-option>
            <mat-chip-option value="absent">Absent</mat-chip-option>
          </mat-chip-listbox>
        </div>
      </mat-card>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="structure-header">
          <mat-form-field appearance="fill" class="class-select">
            <mat-label>Student</mat-label>
            <mat-select [(ngModel)]="newStudentId">
              <mat-option *ngFor="let s of students" [value]="s.id">{{s.firstName}} {{s.lastName}}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="fill" class="class-select">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="newStatus">
              <mat-option value="present">Present</mat-option>
              <mat-option value="absent">Absent</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-flat-button color="accent" class="record-btn" (click)="addAttendance()">
            <svg class="icon" viewBox="0 0 24 24"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" fill="currentColor"/></svg>
            Mark attendance
          </button>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2">
        <mat-card-title>Attendance log</mat-card-title>
        <mat-card-subtitle>Filter by student, date, or status.</mat-card-subtitle>

        <div class="table-wrap">
          <table mat-table [dataSource]="dataSource" matSort class="fees-table">
            <ng-container matColumnDef="student">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Student</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-title">{{ row.studentName }}</div>
                <div class="cell-meta">ID #{{ row.studentId }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="class">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Class</th>
              <td mat-cell *matCellDef="let row">{{ row.class || '--' }}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
              <td mat-cell *matCellDef="let row">{{ row.date }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip class="status-chip" [color]="row.status === 'present' ? 'primary' : 'warn'">
                  {{ row.status }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let row">
                <button mat-stroked-button color="accent" class="ghost-button" (click)="toggleStatus(row)">
                  Toggle
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="empty-state" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">
                <div class="fee-empty">No attendance matches your filters.</div>
              </td>
            </tr>
          </table>
        </div>
        <mat-paginator [pageSize]="8" [pageSizeOptions]="[8, 15, 25]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `
})
export class AttendanceComponent implements AfterViewInit {
  attendance: any[] = [];
  students: any[] = [];
  rows: AttendanceRow[] = [];
  dataSource = new MatTableDataSource<AttendanceRow>([]);
  displayedColumns = ['student','class','date','status','actions'];
  search = '';
  statusFilter: 'all' | 'present' | 'absent' = 'all';
  newStudentId: number | null = null;
  newDate: string = new Date().toISOString().slice(0,10);
  newStatus: 'present' | 'absent' = 'present';
  summary = { present: 0, absent: 0, total: 0 };
  today = new Date().toISOString().slice(0,10);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private mock: MockDataService) {
    this.attendance = mock.getAttendance();
  }

  ngOnInit() {
    this.students = this.mock.getStudents();
    if (this.students.length) this.newStudentId = this.students[0].id;
    this.loadRows();
  }

  ngAfterViewInit() {
    this.attachTableHelpers();
  }

  loadRows() {
    const studentById = new Map(this.students.map(s => [s.id, s]));
    this.rows = this.attendance.map(a => {
      const st = studentById.get(a.studentId);
      return {
        id: a.id,
        studentId: a.studentId,
        studentName: st ? `${st.firstName} ${st.lastName}` : `Student ${a.studentId}`,
        class: st?.class,
        date: a.date,
        status: a.status
      };
    });
    this.applyFilters();
    this.refreshSummary();
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    const filtered = this.rows.filter(r => {
      const matchesTerm = !term || r.studentName.toLowerCase().includes(term) || String(r.studentId).includes(term);
      const matchesStatus = this.statusFilter === 'all' || r.status === this.statusFilter;
      const matchesDate = !this.newDate || r.date === this.newDate;
      return matchesTerm && matchesStatus && matchesDate;
    });
    this.dataSource.data = filtered;
    this.attachTableHelpers();
  }

  attachTableHelpers() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.paginator.firstPage();
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  clearSearch() {
    this.search = '';
    this.applyFilters();
  }

  onStatusChange(event: any) {
    const value = event && 'value' in event ? event.value : null;
    this.statusFilter = value || 'all';
    this.applyFilters();
  }

  addAttendance() {
    if (!this.newStudentId) return;
    this.mock.addAttendance(this.newStudentId, this.newDate, this.newStatus);
    this.attendance = this.mock.getAttendance();
    this.loadRows();
  }

  toggleStatus(row: AttendanceRow) {
    const next = row.status === 'present' ? 'absent' : 'present';
    this.mock.updateAttendanceStatus(row.id, next);
    this.attendance = this.mock.getAttendance();
    this.loadRows();
  }

  refreshSummary() {
    this.summary.present = this.rows.filter(r => r.status === 'present').length;
    this.summary.absent = this.rows.filter(r => r.status === 'absent').length;
    this.summary.total = this.students.length;
  }
}
