import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { MaterialModule } from '../../core/material.module';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatChipListboxChange } from '@angular/material/chips';

type FeeRow = {
  studentId: number;
  studentName: string;
  class?: string;
  balance: number;
  lastPaid?: string;
  status: 'due' | 'clear';
};

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  styleUrls: ['./fees.scss'],
  template: `
    <div class="fees-page">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">Finance</div>
          <div class="title">Fee Management</div>
        </div>
        <span class="spacer"></span>
        <div class="toolbar-actions">
          <button mat-stroked-button color="accent" [routerLink]="['/schools/fees/history']">
            <svg class="icon" viewBox="0 0 24 24"><path d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7v2l3-3-3-3v2z" fill="currentColor"/></svg>
            History
          </button>
          <button mat-flat-button color="accent" [routerLink]="['/schools/fees/collect']">
            <svg class="icon" viewBox="0 0 24 24"><path d="M21 7H3c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H3V9h18v6zm-2-3.5c0 .83-.67 1.5-1.5 1.5S16 12.33 16 11.5 16.67 10 17.5 10s1.5.67 1.5 1.5z" fill="currentColor"/></svg>
            Collect Fee
          </button>
        </div>
      </mat-toolbar>

      <div class="summary-grid">
        <mat-card class="metric-card mat-elevation-z2">
          <div class="metric-icon">
            <svg class="icon" viewBox="0 0 24 24"><path d="M21 7H3c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H3V9h18v6zm-2-3.5c0 .83-.67 1.5-1.5 1.5S16 12.33 16 11.5 16.67 10 17.5 10s1.5.67 1.5 1.5z" fill="currentColor"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-label">Outstanding</div>
            <div class="metric-value">{{ summary.outstanding | currency }}</div>
            <div class="metric-hint">Across {{ viewRows.length }} students</div>
          </div>
        </mat-card>

        <mat-card class="metric-card mat-elevation-z2">
          <div class="metric-icon warn">
            <svg class="icon" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V8h2v6z" fill="currentColor"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-label">Due students</div>
            <div class="metric-value warn-text">{{ summary.dueCount }}</div>
            <div class="metric-hint">Cleared: {{ summary.clearedCount }}</div>
            <mat-progress-bar mode="determinate" [value]="collectionProgress"></mat-progress-bar>
          </div>
        </mat-card>

        <mat-card class="metric-card mat-elevation-z2">
          <div class="metric-icon success">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l4.75 2.85.75-1.23-3.5-2.07V7z" fill="currentColor"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-label">Latest payment</div>
            <div class="metric-value">{{ summary.latestPayment || '—' }}</div>
            <div class="metric-hint">Refresh after collection</div>
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
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="name, id, class" />
            <button *ngIf="search" matSuffix mat-icon-button aria-label="Clear search" (click)="clearSearch()">
              <svg class="icon" viewBox="0 0 24 24"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L12 13.41l-4.89 4.9-1.41-1.42L10.59 12 4.29 5.71 5.7 4.29 12 10.59l6.29-6.3z" fill="currentColor"/></svg>
            </button>
          </mat-form-field>

          <mat-chip-listbox class="status-chips" [value]="statusFilter" (selectionChange)="onStatusChange($event)">
            <mat-chip-option value="all">All</mat-chip-option>
            <mat-chip-option value="due">Due</mat-chip-option>
            <mat-chip-option value="clear">Clear</mat-chip-option>
          </mat-chip-listbox>

          <div class="filter-actions">
            <button mat-stroked-button color="accent" class="ghost-button" [routerLink]="['/schools/fees/categories']">
              <svg class="icon" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 5h8v3h-8v-3zm0-5h8v3h-8v-3z" fill="currentColor"/></svg>
              Categories
            </button>
            <button mat-stroked-button color="accent" class="ghost-button" [routerLink]="['/schools/fees/structure']">
              <svg class="icon" viewBox="0 0 24 24"><path d="M4 6c0 1.66 3.58 3 8 3s8-1.34 8-3-3.58-3-8-3-8 1.34-8 3zm0 4c0 1.66 3.58 3 8 3s8-1.34 8-3V8c-1.73 1.27-5.02 2-8 2s-6.27-.73-8-2v2zm0 4c0 1.66 3.58 3 8 3s8-1.34 8-3v-2c-1.73 1.27-5.02 2-8 2s-6.27-.73-8-2v2z" fill="currentColor"/></svg>
              Structure
            </button>
            <button mat-stroked-button color="accent" class="ghost-button" [routerLink]="['/schools/fees/my-fees']">
              <svg class="icon" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>
              My Fees
            </button>
          </div>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2">
        <mat-card-title>Student balances</mat-card-title>
        <mat-card-subtitle>Quickly check outstanding balances and record payments.</mat-card-subtitle>

        <div class="table-wrap">
          <table mat-table matSort matSortDisableClear [dataSource]="dataSource" class="fees-table">
            <ng-container matColumnDef="student">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Student</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-title">{{ row.studentName }}</div>
                <div class="cell-meta">ID #{{ row.studentId }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="class">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Class</th>
              <td mat-cell *matCellDef="let row">{{ row.class || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="balance">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Balance</th>
              <td mat-cell *matCellDef="let row">
                <span [class.due]="row.status === 'due'" [class.clear]="row.status === 'clear'">
                  {{ row.balance | currency }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="lastPaid">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Paid</th>
              <td mat-cell *matCellDef="let row">{{ row.lastPaid || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip class="status-chip" [color]="row.status === 'due' ? 'warn' : 'primary'">
                  {{ row.status === 'due' ? 'Due' : 'Clear' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Collect</th>
              <td mat-cell *matCellDef="let row">
                <div class="action-row">
                  <mat-form-field appearance="fill" class="compact-number">
                    <mat-label>Amount</mat-label>
                    <input matInput type="number" min="0" [(ngModel)]="paymentAmounts[row.studentId]" />
                  </mat-form-field>
                  <button mat-flat-button color="accent" class="record-btn" (click)="pay(row.studentId)" [disabled]="!paymentAmounts[row.studentId]">
                    <svg class="icon" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15-4-4 1.41-1.41L10 14.17l6.59-6.58L18 9l-8 8z" fill="currentColor"/></svg>
                    Record
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="empty-state" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">
                <div class="fee-empty">No students match your filters.</div>
              </td>
            </tr>
          </table>
        </div>

        <mat-paginator [pageSize]="5" [pageSizeOptions]="[5, 10, 25]" showFirstLastButtons></mat-paginator>
      </mat-card>

      <div class="router-outlet-wrap">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class FeesComponent implements AfterViewInit {
  fees: any[] = [];
  search = '';
  paymentAmounts: Record<number, number> = {};
  students: any[] = [];
  viewRows: FeeRow[] = [];
  dataSource = new MatTableDataSource<FeeRow>([]);
  displayedColumns: string[] = ['student','class','balance','lastPaid','status','actions'];
  statusFilter: 'all' | 'due' | 'clear' = 'all';
  summary = { outstanding: 0, dueCount: 0, clearedCount: 0, latestPayment: '' };
  collectionProgress = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private mock: MockDataService) {
    this.fees = this.mock.getFees();
  }

  ngOnInit() {
    this.loadRows();
  }

  ngAfterViewInit() {
    this.attachTableHelpers();
  }

  loadRows() {
    this.students = this.mock.getStudents();
    this.fees = this.mock.getFees();
    const feeByStudent = new Map(this.fees.map(f => [f.studentId, f]));
    this.viewRows = this.students.map(st => {
      const fee = feeByStudent.get(st.id);
      const balance = Number(fee?.balance) || 0;
      return {
        studentId: st.id,
        studentName: `${st.firstName} ${st.lastName}`,
        class: st.class,
        balance,
        lastPaid: fee?.lastPaid,
        status: balance > 0 ? 'due' : 'clear'
      };
    });
    this.viewRows.forEach(r => this.paymentAmounts[r.studentId] = this.paymentAmounts[r.studentId] || 0);
    this.applyFilters();
    this.refreshSummary();
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    const filtered = this.viewRows.filter(row => {
      const matchesTerm = !term || row.studentName.toLowerCase().includes(term) || String(row.studentId).includes(term) || (row.class || '').toLowerCase().includes(term);
      const matchesStatus = this.statusFilter === 'all' || row.status === this.statusFilter;
      return matchesTerm && matchesStatus;
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
    const value = (event && 'value' in event) ? (event as any).value : null;
    this.statusFilter = value || 'all';
    this.applyFilters();
  }

  pay(studentId: number) {
    const amount = Number(this.paymentAmounts[studentId]) || 0;
    if (amount <= 0) return;
    const today = new Date().toISOString().slice(0,10);
    this.mock.payFee(studentId, amount, today);
    this.paymentAmounts[studentId] = 0;
    this.loadRows();
  }

  refreshSummary() {
    this.summary.outstanding = this.viewRows.reduce((sum, r) => sum + (Number(r.balance) || 0), 0);
    this.summary.dueCount = this.viewRows.filter(r => r.status === 'due').length;
    this.summary.clearedCount = this.viewRows.filter(r => r.status === 'clear').length;
    const latest = this.viewRows
      .map(r => r.lastPaid)
      .filter(Boolean)
      .map(d => new Date(d as string))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    this.summary.latestPayment = latest ? latest.toISOString().slice(0,10) : '';
    const total = this.viewRows.length;
    this.collectionProgress = total ? Math.round((this.summary.clearedCount / total) * 100) : 0;
  }
}
