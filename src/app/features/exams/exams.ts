import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { MaterialModule } from '../../core/material.module';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['../fees/fees.scss','./exams.scss'],
  template: `
    <div class="fees-page exams-page">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">School Management</div>
          <div class="title">Exams & Results</div>
        </div>
      </mat-toolbar>

      <div class="summary-grid">
        <mat-card class="metric-card mat-elevation-z2">
          <div class="metric-icon">
            <svg class="icon" viewBox="0 0 24 24"><path d="M5 4v3h5.5v12h3V7H19V4z" fill="currentColor"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-label">Total exams</div>
            <div class="metric-value">{{ exams.length }}</div>
            <div class="metric-hint">Managed in this module</div>
          </div>
        </mat-card>

        <mat-card class="metric-card mat-elevation-z2">
          <div class="metric-icon success">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 5h2v4h4v2h-6V7z" fill="currentColor"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-label">Next exam</div>
            <div class="metric-value">{{ metrics.nextExam || '--' }}</div>
            <div class="metric-hint">Sorted by date</div>
          </div>
        </mat-card>

        <mat-card class="metric-card mat-elevation-z2">
          <div class="metric-icon warn">
            <svg class="icon" viewBox="0 0 24 24"><path d="M7 5h14v2H7V5zm0 4h14v2H7V9zm0 4h14v2H7v-2zm0 4h14v2H7v-2zM3 5h2v2H3V5zm0 4h2v2H3V9zm0 4h2v2H3v-2zm0 4h2v2H3v-2z" fill="currentColor"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-label">Students marked</div>
            <div class="metric-value warn-text">{{ metrics.totalMarks }}</div>
            <div class="metric-hint">Across all exams</div>
          </div>
        </mat-card>
      </div>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill" class="full-width search-field">
            <mat-label>Search exam</mat-label>
            <span matPrefix class="icon-wrap">
              <svg class="icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28h.79l5 4.99L20.49 19l-5-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg>
            </span>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="title or date" />
            <button *ngIf="search" matSuffix mat-icon-button aria-label="Clear search" (click)="clearSearch()">
              <svg class="icon" viewBox="0 0 24 24"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L12 13.41l-4.89 4.9-1.41-1.42L10.59 12 4.29 5.71 5.7 4.29 12 10.59l6.29-6.3z" fill="currentColor"/></svg>
            </button>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Date</mat-label>
            <input matInput type="date" [(ngModel)]="dateFilter" (ngModelChange)="applyFilters()" />
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="structure-header">
          <mat-form-field appearance="fill" class="class-select">
            <mat-label>Title</mat-label>
            <input matInput [(ngModel)]="newTitle" />
          </mat-form-field>
          <mat-form-field appearance="fill" class="class-select">
            <mat-label>Date</mat-label>
            <input matInput type="date" [(ngModel)]="newDate" />
          </mat-form-field>
          <mat-form-field appearance="fill" class="class-select">
            <mat-label>Assign students</mat-label>
            <mat-select multiple [(ngModel)]="selectedStudentIds">
              <mat-option *ngFor="let s of students" [value]="s.id">{{s.firstName}} {{s.lastName}}</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-flat-button color="accent" class="record-btn" (click)="createExam()">
            <svg class="icon" viewBox="0 0 24 24"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" fill="currentColor"/></svg>
            Create exam
          </button>
        </div>
      </mat-card>

      <div class="exam-grid desktop-only">
        <mat-card class="table-card mat-elevation-z2" *ngFor="let e of filteredExams">
          <mat-card-title>{{ e.title }}</mat-card-title>
          <mat-card-subtitle>{{ e.date }} · {{ e.studentMarks?.length || 0 }} students</mat-card-subtitle>

          <div class="table-wrap">
            <table class="fees-table">
              <thead>
                <tr><th>Student</th><th>Marks</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let sm of e.studentMarks">
                  <td>
                    <div class="cell-title">{{ studentName(sm.studentId) }}</div>
                    <div class="cell-meta">ID #{{ sm.studentId }}</div>
                  </td>
                  <td>
                    <mat-form-field appearance="fill" class="compact-number">
                      <mat-label>Marks</mat-label>
                      <input matInput type="number" [(ngModel)]="sm.marks" />
                    </mat-form-field>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="card-actions">
            <button mat-flat-button color="accent" class="record-btn" (click)="saveMarks(e)">
              <svg class="icon" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15-4-4 1.41-1.41L10 14.17l6.59-6.58L18 9l-8 8z" fill="currentColor"/></svg>
              Save marks
            </button>
          </div>
        </mat-card>
      </div>

      <div class="mobile-only mobile-card-list">
        <div class="mobile-card" *ngFor="let e of filteredExams">
          <div class="card-row">
            <div class="cell-title">{{ e.title }}</div>
            <mat-chip color="primary" selected>{{ e.date }}</mat-chip>
          </div>
          <div class="cell-sub">Students: {{ e.studentMarks?.length || 0 }}</div>
          <div class="mobile-marks" *ngFor="let sm of e.studentMarks">
            <div class="cell-meta">{{ studentName(sm.studentId) }}</div>
            <mat-form-field appearance="fill" class="compact-number">
              <mat-label>Marks</mat-label>
              <input matInput type="number" [(ngModel)]="sm.marks" />
            </mat-form-field>
          </div>
          <div class="card-actions">
            <button mat-flat-button color="accent" class="record-btn" (click)="saveMarks(e)">
              Save marks
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ExamsComponent {
  exams: any[] = [];
  students: any[] = [];
  search = '';
  dateFilter = '';
  newTitle = '';
  newDate = new Date().toISOString().slice(0,10);
  selectedStudentIds: number[] = [];
  metrics = { nextExam: '', totalMarks: 0 };

  constructor(private mock: MockDataService) {
    this.exams = mock.getExams();
    this.students = mock.getStudents();
    this.refreshMetrics();
  }

  get filteredExams() {
    const term = this.search.trim().toLowerCase();
    return this.exams.filter(e => {
      const matchesTerm = !term || e.title.toLowerCase().includes(term) || e.date.includes(term);
      const matchesDate = !this.dateFilter || e.date === this.dateFilter;
      return matchesTerm && matchesDate;
    });
  }

  clearSearch() {
    this.search = '';
    this.applyFilters();
  }

  applyFilters() {
    this.exams = this.mock.getExams();
  }

  studentName(id: number) { const s = this.students.find(x => x.id === id); return s ? `${s.firstName} ${s.lastName}` : id; }

  createExam() {
    if (!this.newTitle) return;
    this.mock.createExam(this.newTitle, this.newDate, this.selectedStudentIds);
    this.exams = this.mock.getExams();
    this.newTitle = '';
    this.selectedStudentIds = [];
    this.refreshMetrics();
  }

  saveMarks(exam: any) {
    const marks = exam.studentMarks.map((sm: any) => ({ studentId: sm.studentId, marks: Number(sm.marks) }));
    this.mock.recordMarks(exam.id, marks);
    this.exams = this.mock.getExams();
    this.refreshMetrics();
  }

  refreshMetrics() {
    const dates = this.exams.map(e => e.date).filter(Boolean).sort();
    this.metrics.nextExam = dates[0] || '';
    this.metrics.totalMarks = this.exams.reduce((sum, e) => sum + (e.studentMarks?.length || 0), 0);
  }
}
