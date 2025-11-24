import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../core/material.module';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-fee-discounts',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['../fees.scss', './discounts.scss'],
  template: `
    <div class="fees-page">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">Fees</div>
          <div class="title">Discounts & Waivers</div>
        </div>
      </mat-toolbar>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill" class="full-width search-field">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="student or discount id" />
            <button *ngIf="search" matSuffix mat-icon-button aria-label="Clear search" (click)="clearSearch()">
              <svg class="icon" viewBox="0 0 24 24"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L12 13.41l-4.89 4.9-1.41-1.42L10.59 12 4.29 5.71 5.7 4.29 12 10.59l6.29-6.3z" fill="currentColor"/></svg>
            </button>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilters()">
              <mat-option value="">All</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="expired">Expired</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="structure-header">
          <mat-form-field appearance="fill" class="class-select">
            <mat-label>Student name</mat-label>
            <input matInput [(ngModel)]="form.studentName" />
          </mat-form-field>
          <mat-form-field appearance="fill" class="class-select">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="form.type">
              <mat-option value="Scholarship">Scholarship</mat-option>
              <mat-option value="Sibling">Sibling</mat-option>
              <mat-option value="Waiver">Waiver</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill" class="class-select">
            <mat-label>Amount</mat-label>
            <input matInput type="number" [(ngModel)]="form.amount" />
          </mat-form-field>
          <mat-form-field appearance="fill" class="class-select">
            <mat-label>Reason</mat-label>
            <input matInput [(ngModel)]="form.reason" />
          </mat-form-field>
          <button mat-flat-button color="accent" class="record-btn" (click)="addDiscount()">
            <svg class="icon" viewBox="0 0 24 24"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" fill="currentColor"/></svg>
            Add discount
          </button>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2 desktop-only">
        <mat-card-title>Discounts</mat-card-title>
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered" class="fees-table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let row">{{ row.id }}</td>
            </ng-container>
            <ng-container matColumnDef="student">
              <th mat-header-cell *matHeaderCellDef>Student</th>
              <td mat-cell *matCellDef="let row">{{ row.studentName }}</td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let row">{{ row.type }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let row">{{ row.amount | currency }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="row.status === 'active' ? 'primary' : 'warn'" selected>{{ row.status }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-stroked-button color="warn" class="ghost-button" (click)="expire(row)">Expire</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="empty-state" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">
                <div class="fee-empty">No discounts found.</div>
              </td>
            </tr>
          </table>
        </div>
      </mat-card>

      <mat-card class="mobile-only mobile-card-list">
        <div class="mobile-card" *ngFor="let row of filtered">
          <div class="card-row">
            <div class="cell-title">{{ row.studentName }}</div>
            <mat-chip [color]="row.status === 'active' ? 'primary' : 'warn'" selected>{{ row.status }}</mat-chip>
          </div>
          <div class="cell-meta">ID {{ row.id }} · {{ row.type }}</div>
          <div class="cell-strong">{{ row.amount | currency }}</div>
          <div class="cell-meta">{{ row.reason || '' }}</div>
          <div class="action-row">
            <button mat-stroked-button color="warn" class="ghost-button" (click)="expire(row)">Expire</button>
          </div>
        </div>
      </mat-card>
    </div>
  `
})
export class FeeDiscountsComponent {
  discounts: any[] = [];
  filtered: any[] = [];
  displayedColumns = ['id','student','type','amount','status','actions'];
  search = '';
  statusFilter = '';
  form: any = { studentName: '', type: 'Scholarship', amount: 0, reason: '' };

  constructor(private mock: MockDataService) {
    this.refresh();
  }

  refresh() {
    this.discounts = this.mock.getDiscounts();
    this.applyFilters();
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered = this.discounts.filter(d => {
      const matchesTerm = !term || d.studentName.toLowerCase().includes(term) || d.id.toLowerCase().includes(term);
      const matchesStatus = !this.statusFilter || d.status === this.statusFilter;
      return matchesTerm && matchesStatus;
    });
  }

  clearSearch() { this.search = ''; this.applyFilters(); }

  addDiscount() {
    if (!this.form.studentName || !this.form.amount) return;
    this.mock.addDiscount({ ...this.form, studentId: 0 });
    this.discounts = this.mock.getDiscounts();
    this.form = { studentName: '', type: 'Scholarship', amount: 0, reason: '' };
    this.applyFilters();
  }

  expire(row: any) {
    this.mock.updateDiscountStatus(row.id, 'expired');
    this.discounts = this.mock.getDiscounts();
    this.applyFilters();
  }
}
