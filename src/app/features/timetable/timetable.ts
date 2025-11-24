import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { MaterialModule } from '../../core/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

type TimetableRow = {
  id: number;
  classId: string;
  subject: string;
  teacher: string;
  day: string;
  time: string;
};

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['../fees/fees.scss','./timetable.scss'],
  template: `
    <div class="fees-page timetable-page">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">School Management</div>
          <div class="title">Timetable</div>
        </div>
      </mat-toolbar>

      <div class="summary-grid">
        <mat-card class="metric-card mat-elevation-z2">
          <div class="metric-icon">
            <svg class="icon" viewBox="0 0 24 24"><path d="M3 5h18v2H3V5zm2 4h14v2H5V9zm-2 4h18v2H3v-2zm2 4h14v2H5v-2z" fill="currentColor"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-label">Entries</div>
            <div class="metric-value">{{ rows.length }}</div>
            <div class="metric-hint">Across all classes</div>
          </div>
        </mat-card>

        <mat-card class="metric-card mat-elevation-z2">
          <div class="metric-icon success">
            <svg class="icon" viewBox="0 0 24 24"><path d="M4 4h16v2H4V4zm0 5h16v2H4V9zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" fill="currentColor"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-label">Classes</div>
            <div class="metric-value">{{ classCount }}</div>
            <div class="metric-hint">With scheduled slots</div>
          </div>
        </mat-card>

        <mat-card class="metric-card mat-elevation-z2">
          <div class="metric-icon warn">
            <svg class="icon" viewBox="0 0 24 24"><path d="M19 3H5a2 2 0 0 0-2 2v14l4-4h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" fill="currentColor"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-label">Next day</div>
            <div class="metric-value warn-text">{{ nextDay || '--' }}</div>
            <div class="metric-hint">Earliest scheduled day</div>
          </div>
        </mat-card>
      </div>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill" class="full-width search-field">
            <mat-label>Search subject/teacher</mat-label>
            <span matPrefix class="icon-wrap">
              <svg class="icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28h.79l5 4.99L20.49 19l-5-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg>
            </span>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="subject, teacher, class" />
            <button *ngIf="search" matSuffix mat-icon-button aria-label="Clear search" (click)="clearSearch()">
              <svg class="icon" viewBox="0 0 24 24"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L12 13.41l-4.89 4.9-1.41-1.42L10.59 12 4.29 5.71 5.7 4.29 12 10.59l6.29-6.3z" fill="currentColor"/></svg>
            </button>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Class</mat-label>
            <mat-select [(ngModel)]="filterClass" (selectionChange)="applyFilters()">
              <mat-option value="">All</mat-option>
              <mat-option *ngFor="let c of classes" [value]="c.id">{{c.name}}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Day</mat-label>
            <mat-select [(ngModel)]="filterDay" (selectionChange)="applyFilters()">
              <mat-option value="">All</mat-option>
              <mat-option *ngFor="let d of days" [value]="d">{{d}}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="structure-header">
          <mat-form-field appearance="fill" class="class-select">
            <mat-label>Class</mat-label>
            <mat-select [(ngModel)]="newEntry.classId">
              <mat-option *ngFor="let c of classes" [value]="c.id">{{c.name}}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill" class="class-select">
            <mat-label>Subject</mat-label>
            <input matInput [(ngModel)]="newEntry.subject" />
          </mat-form-field>
          <mat-form-field appearance="fill" class="class-select">
            <mat-label>Teacher</mat-label>
            <input matInput [(ngModel)]="newEntry.teacher" />
          </mat-form-field>
          <mat-form-field appearance="fill" class="class-select">
            <mat-label>Day</mat-label>
            <mat-select [(ngModel)]="newEntry.day">
              <mat-option *ngFor="let d of days" [value]="d">{{d}}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill" class="class-select">
            <mat-label>Time</mat-label>
            <input matInput [(ngModel)]="newEntry.time" placeholder="09:00" />
          </mat-form-field>
          <button mat-flat-button color="accent" class="record-btn" (click)="addEntry()">
            <svg class="icon" viewBox="0 0 24 24"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" fill="currentColor"/></svg>
            Add slot
          </button>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2">
        <mat-card-title>Schedule</mat-card-title>
        <mat-card-subtitle>Class-wise sessions with filters.</mat-card-subtitle>

        <div class="table-wrap">
          <table mat-table [dataSource]="dataSource" matSort class="fees-table">
            <ng-container matColumnDef="classId">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Class</th>
              <td mat-cell *matCellDef="let row">{{ row.classId }}</td>
            </ng-container>
            <ng-container matColumnDef="subject">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Subject</th>
              <td mat-cell *matCellDef="let row">{{ row.subject }}</td>
            </ng-container>
            <ng-container matColumnDef="teacher">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Teacher</th>
              <td mat-cell *matCellDef="let row">{{ row.teacher }}</td>
            </ng-container>
            <ng-container matColumnDef="day">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Day</th>
              <td mat-cell *matCellDef="let row">{{ row.day }}</td>
            </ng-container>
            <ng-container matColumnDef="time">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Time</th>
              <td mat-cell *matCellDef="let row">{{ row.time }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-stroked-button color="warn" class="ghost-button" (click)="deleteEntry(row.id)">Delete</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="empty-state" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">
                <div class="fee-empty">No timetable entries match your filters.</div>
              </td>
            </tr>
          </table>
        </div>
        <mat-paginator [pageSize]="8" [pageSizeOptions]="[8, 15, 25]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `
})
export class TimetableComponent implements AfterViewInit {
  classes: any[] = [];
  rows: TimetableRow[] = [];
  dataSource = new MatTableDataSource<TimetableRow>([]);
  displayedColumns = ['classId','subject','teacher','day','time','actions'];
  newEntry: TimetableRow = { id: 0, classId: '', subject: '', teacher: '', day: '', time: '' };
  search = '';
  filterClass = '';
  filterDay = '';
  classCount = 0;
  nextDay = '';
  days = ['Mon','Tue','Wed','Thu','Fri','Sat'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private mock: MockDataService) {
    this.classes = mock.getClasses();
    this.rows = mock.getTimetable();
  }

  ngOnInit() {
    this.applyFilters();
    this.refreshSummary();
  }

  ngAfterViewInit() {
    this.attachTableHelpers();
  }

  addEntry() {
    if (!this.newEntry.classId || !this.newEntry.subject) return;
    this.mock.addTimetableEntry({ ...this.newEntry });
    this.rows = this.mock.getTimetable();
    this.newEntry = { id: 0, classId: '', subject: '', teacher: '', day: '', time: '' };
    this.applyFilters();
    this.refreshSummary();
  }

  deleteEntry(id: number) {
    this.mock.deleteTimetableEntry(id);
    this.rows = this.mock.getTimetable();
    this.applyFilters();
    this.refreshSummary();
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    const filtered = this.rows.filter(r => {
      const matchesTerm = !term || r.subject.toLowerCase().includes(term) || r.teacher.toLowerCase().includes(term) || r.classId.toLowerCase().includes(term);
      const matchesClass = !this.filterClass || r.classId === this.filterClass;
      const matchesDay = !this.filterDay || r.day === this.filterDay;
      return matchesTerm && matchesClass && matchesDay;
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

  refreshSummary() {
    this.classCount = new Set(this.rows.map(r => r.classId)).size;
    const dayOrder = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const sorted = this.rows
      .map(r => r.day)
      .filter(Boolean)
      .sort((a,b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    this.nextDay = sorted[0] || '';
  }
}
