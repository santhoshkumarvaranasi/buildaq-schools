import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../core/material.module';
import { MockDataService } from '../../../core/services/mock-data.service';

type ReminderRow = {
  studentId: number;
  studentName: string;
  class?: string;
  balance: number;
  lastPaid?: string;
  lastReminder?: string;
};

@Component({
  selector: 'app-fee-reminders',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['../fees.scss', './reminders.scss'],
  template: `
    <div class="fees-page">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">Fees</div>
          <div class="title">Overdue reminders</div>
        </div>
      </mat-toolbar>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill" class="full-width search-field">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="student or class" />
            <button *ngIf="search" matSuffix mat-icon-button aria-label="Clear search" (click)="clearSearch()">
              <svg class="icon" viewBox="0 0 24 24"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L12 13.41l-4.89 4.9-1.41-1.42L10.59 12 4.29 5.71 5.7 4.29 12 10.59l6.29-6.3z" fill="currentColor"/></svg>
            </button>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2 desktop-only">
        <mat-card-title>Outstanding fees</mat-card-title>
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered" class="fees-table">
            <ng-container matColumnDef="student">
              <th mat-header-cell *matHeaderCellDef>Student</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-title">{{ row.studentName }}</div>
                <div class="cell-meta">ID #{{ row.studentId }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="class">
              <th mat-header-cell *matHeaderCellDef>Class</th>
              <td mat-cell *matCellDef="let row">{{ row.class || '--' }}</td>
            </ng-container>
            <ng-container matColumnDef="balance">
              <th mat-header-cell *matHeaderCellDef>Balance</th>
              <td mat-cell *matCellDef="let row">{{ row.balance | currency }}</td>
            </ng-container>
            <ng-container matColumnDef="lastPaid">
              <th mat-header-cell *matHeaderCellDef>Last Paid</th>
              <td mat-cell *matCellDef="let row">{{ row.lastPaid || '--' }}</td>
            </ng-container>
            <ng-container matColumnDef="reminder">
              <th mat-header-cell *matHeaderCellDef>Last Reminder</th>
              <td mat-cell *matCellDef="let row">{{ row.lastReminder || 'Not sent' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-stroked-button color="primary" class="ghost-button" (click)="markReminder(row)">Mark sent</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="empty-state" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length"><div class="fee-empty">No outstanding balances found.</div></td>
            </tr>
          </table>
        </div>
      </mat-card>

      <mat-card class="mobile-only mobile-card-list">
        <div class="mobile-card" *ngFor="let row of filtered">
          <div class="card-row">
            <div class="cell-title">{{ row.studentName }}</div>
            <mat-chip color="warn" selected>Due</mat-chip>
          </div>
          <div class="cell-meta">Class {{ row.class || '--' }}</div>
          <div class="cell-meta">Last paid: {{ row.lastPaid || '--' }}</div>
          <div class="cell-strong">Balance: {{ row.balance | currency }}</div>
          <div class="cell-meta">Last reminder: {{ row.lastReminder || 'Not sent' }}</div>
          <div class="action-row">
            <button mat-stroked-button color="primary" class="ghost-button" (click)="markReminder(row)">Mark sent</button>
          </div>
        </div>
      </mat-card>
    </div>
  `
})
export class FeeRemindersComponent {
  rows: ReminderRow[] = [];
  filtered: ReminderRow[] = [];
  search = '';
  displayedColumns = ['student','class','balance','lastPaid','reminder','actions'];

  constructor(private mock: MockDataService) {
    this.refresh();
  }

  refresh() {
    const students = this.mock.getStudents();
    const fees = this.mock.getFees();
    const byId = new Map(fees.map(f => [f.studentId, f]));
    this.rows = students
      .map(st => {
        const fee = byId.get(st.id);
        const balance = Number(fee?.balance) || 0;
        if (balance <= 0) return null;
        return {
          studentId: st.id,
          studentName: `${st.firstName} ${st.lastName}`,
          class: st.class,
          balance,
          lastPaid: fee?.lastPaid,
          lastReminder: (fee as any)?.lastReminder
        } as ReminderRow;
      })
      .filter(Boolean) as ReminderRow[];
    this.applyFilters();
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered = this.rows.filter(r =>
      !term ||
      r.studentName.toLowerCase().includes(term) ||
      (r.class || '').toLowerCase().includes(term)
    );
  }

  clearSearch() { this.search = ''; this.applyFilters(); }

  markReminder(row: ReminderRow) {
    const today = new Date().toISOString().slice(0,10);
    const fee = this.mock.getFees().find(f => f.studentId === row.studentId);
    if (fee) (fee as any).lastReminder = today;
    row.lastReminder = today;
    this.applyFilters();
  }
}
