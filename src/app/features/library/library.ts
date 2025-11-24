import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, LibraryItem } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./library.scss'],
  template: `
    <div class="library mat-typography">
      <div class="hero mat-elevation-z2">
        <div>
          <div class="eyebrow">School Management</div>
          <div class="title">Library</div>
        </div>
        <div class="hero-actions">
          <button mat-stroked-button color="primary" (click)="exportCsv()">Export CSV</button>
        </div>
      </div>

      <mat-card class="filters">
        <div class="filter-grid">
          <mat-form-field appearance="fill">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="title, author, borrower" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="status" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="available">Available</mat-option>
              <mat-option value="checked-out">Checked out</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="category" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option *ngFor="let c of categories" [value]="c">{{ c }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card desktop-only">
        <div class="table-title">Catalog</div>
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered" class="mat-elevation-z2 mat-table">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-strong">{{ row.title }}</div>
                <div class="cell-sub">{{ row.author }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let row">{{ row.category }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="row.status === 'available' ? 'primary' : 'warn'" selected>{{ row.status }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="borrower">
              <th mat-header-cell *matHeaderCellDef>Borrower</th>
              <td mat-cell *matCellDef="let row">
                <div *ngIf="row.status === 'checked-out'">
                  <div class="cell-strong">{{ row.borrower }}</div>
                  <div class="cell-sub">Due {{ row.dueDate || '--' }}</div>
                </div>
                <span *ngIf="row.status === 'available'">—</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-stroked-button color="primary" *ngIf="row.status === 'available'" (click)="quickCheckout(row)">Checkout</button>
                <button mat-stroked-button color="accent" *ngIf="row.status === 'checked-out'" (click)="markReturned(row)">Return</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">No books match your filters.</td>
            </tr>
          </table>
        </div>
      </mat-card>

      <mat-card class="mobile-only mobile-card-list">
        <div class="mobile-card" *ngFor="let row of filtered">
          <div class="card-row">
            <div>
              <div class="cell-strong">{{ row.title }}</div>
              <div class="cell-sub">{{ row.author }} · {{ row.category }}</div>
            </div>
            <mat-chip [color]="row.status === 'available' ? 'primary' : 'warn'" selected>{{ row.status }}</mat-chip>
          </div>
          <div class="cell-sub" *ngIf="row.status === 'checked-out'">Borrower: {{ row.borrower }} · Due {{ row.dueDate || '--' }}</div>
          <div class="cell-sub" *ngIf="row.status === 'available'">Available for checkout</div>
          <div class="action-row">
            <button mat-stroked-button color="primary" *ngIf="row.status === 'available'" (click)="quickCheckout(row)">Checkout</button>
            <button mat-stroked-button color="accent" *ngIf="row.status === 'checked-out'" (click)="markReturned(row)">Return</button>
          </div>
        </div>
      </mat-card>
    </div>
  `
})
export class LibraryComponent {
  items: LibraryItem[] = [];
  filtered: LibraryItem[] = [];
  categories: string[] = [];
  displayedColumns = ['title', 'category', 'status', 'borrower', 'actions'];
  search = '';
  status: 'all' | 'available' | 'checked-out' = 'all';
  category: string = 'all';

  constructor(private mock: MockDataService) {
    this.refresh();
  }

  refresh() {
    this.items = this.mock.getLibraryItems() || [];
    this.categories = Array.from(new Set(this.items.map(i => i.category).filter(Boolean)));
    this.applyFilters();
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered = this.items.filter(i => {
      const matchesTerm = !term || [i.title, i.author, i.borrower].some(v => (v || '').toLowerCase().includes(term));
      const matchesStatus = this.status === 'all' || i.status === this.status;
      const matchesCategory = this.category === 'all' || i.category === this.category;
      return matchesTerm && matchesStatus && matchesCategory;
    });
  }

  quickCheckout(row: LibraryItem) {
    const borrower = row.borrower || 'Student';
    const due = row.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    this.mock.checkoutBook(row.id, borrower, due);
    this.refresh();
  }

  markReturned(row: LibraryItem) {
    this.mock.returnBook(row.id);
    this.refresh();
  }

  exportCsv() {
    const header = ['Title','Author','Category','Status','Borrower','DueDate'];
    const rows = this.filtered.map(i => [i.title, i.author, i.category, i.status, i.borrower || '', i.dueDate || '']);
    const csv = [header, ...rows].map(r => r.map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'library-catalog.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
