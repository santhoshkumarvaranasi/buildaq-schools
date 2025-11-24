import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../core/material.module';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-fee-receipts',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['../fees.scss'],
  template: `
    <div class="fees-page">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">Fees</div>
          <div class="title">Receipts</div>
        </div>
      </mat-toolbar>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill" class="full-width search-field">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="student or receipt" />
            <button *ngIf="search" matSuffix mat-icon-button aria-label="Clear search" (click)="clearSearch()">
              <svg class="icon" viewBox="0 0 24 24"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L12 13.41l-4.89 4.9-1.41-1.42L10.59 12 4.29 5.71 5.7 4.29 12 10.59l6.29-6.3z" fill="currentColor"/></svg>
            </button>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Method</mat-label>
            <mat-select [(ngModel)]="methodFilter" (selectionChange)="applyFilters()">
              <mat-option value="">All</mat-option>
              <mat-option value="Cash">Cash</mat-option>
              <mat-option value="Online">Online</mat-option>
              <mat-option value="Cheque">Cheque</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button color="primary" class="ghost-button" (click)="exportCsv()">
            Export CSV
          </button>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2">
        <mat-card-title>Receipts</mat-card-title>
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered" class="fees-table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>Receipt</th>
              <td mat-cell *matCellDef="let row">{{ row.id }}</td>
            </ng-container>
            <ng-container matColumnDef="student">
              <th mat-header-cell *matHeaderCellDef>Student</th>
              <td mat-cell *matCellDef="let row">{{ row.studentName }}</td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let row">{{ row.date }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let row">{{ row.amount | currency }}</td>
            </ng-container>
            <ng-container matColumnDef="method">
              <th mat-header-cell *matHeaderCellDef>Method</th>
              <td mat-cell *matCellDef="let row">{{ row.method }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="empty-state" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length"><div class="fee-empty">No receipts found.</div></td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `
})
export class FeeReceiptsComponent {
  receipts: any[] = [];
  filtered: any[] = [];
  search = '';
  methodFilter = '';
  displayedColumns = ['id','student','date','amount','method'];

  constructor(private mock: MockDataService) {
    this.refresh();
  }

  refresh() {
    this.receipts = this.mock.getReceipts();
    this.applyFilters();
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered = this.receipts.filter(r => {
      const matchesTerm = !term || r.studentName.toLowerCase().includes(term) || r.id.toLowerCase().includes(term);
      const matchesMethod = !this.methodFilter || r.method === this.methodFilter;
      return matchesTerm && matchesMethod;
    });
  }

  clearSearch() { this.search = ''; this.applyFilters(); }

  exportCsv() {
    const headers = ['Receipt','Student','Date','Amount','Method'];
    const lines = this.filtered.map(r => [
      r.id,
      `"${(r.studentName || '').replace(/"/g, '""')}"`,
      r.date,
      r.amount,
      r.method
    ].join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'receipts.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
