import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, AssetItem } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./assets.scss'],
  template: `
    <div class="fees-page assets-page mat-typography">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">School Management</div>
          <div class="title">Assets & Inventory</div>
        </div>
        <span class="spacer"></span>
        <button mat-flat-button color="accent" class="record-btn" (click)="addAsset()">
          <span class="icon">+</span>
          Add asset
        </button>
      </mat-toolbar>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="name, id, assigned" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="category" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option *ngFor="let c of categories" [value]="c">{{ c }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="status" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="available">Available</mat-option>
              <mat-option value="assigned">Assigned</mat-option>
              <mat-option value="maintenance">Maintenance</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2 desktop-only">
        <mat-card-title>Asset catalog</mat-card-title>
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered" class="mat-elevation-z2 mat-table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let row">{{ row.id }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-strong">{{ row.name }}</div>
                <div class="cell-sub">{{ row.category }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="statusColor(row.status)" selected>{{ row.status }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="assigned">
              <th mat-header-cell *matHeaderCellDef>Assigned</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-strong">{{ row.assignedTo || '—' }}</div>
                <div class="cell-sub">{{ row.assignedType || '' }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="location">
              <th mat-header-cell *matHeaderCellDef>Location</th>
              <td mat-cell *matCellDef="let row">{{ row.location || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="due">
              <th mat-header-cell *matHeaderCellDef>Due</th>
              <td mat-cell *matCellDef="let row">{{ row.dueDate || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-stroked-button color="accent" class="ghost-button" (click)="toggleAssign(row)">Toggle assign</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">No assets match your filters.</td>
            </tr>
          </table>
        </div>
      </mat-card>

      <mat-card class="mobile-only mobile-card-list">
        <div class="mobile-card" *ngFor="let row of filtered">
          <div class="card-row">
            <div class="cell-strong">{{ row.name }}</div>
            <mat-chip [color]="statusColor(row.status)" selected>{{ row.status }}</mat-chip>
          </div>
          <div class="cell-sub">{{ row.id }} · {{ row.category }}</div>
          <div class="cell-sub">Assigned: {{ row.assignedTo || '—' }} {{ row.assignedType ? '(' + row.assignedType + ')' : '' }}</div>
          <div class="cell-sub">Location: {{ row.location || '—' }}</div>
          <div class="cell-sub">Due: {{ row.dueDate || '—' }}</div>
          <div class="action-row">
            <button mat-stroked-button color="accent" class="ghost-button" (click)="toggleAssign(row)">Toggle assign</button>
          </div>
        </div>
      </mat-card>
    </div>
  `
})
export class AssetsComponent {
  assets: AssetItem[] = [];
  filtered: AssetItem[] = [];
  categories: string[] = [];
  search = '';
  category = 'all';
  status: 'all' | AssetItem['status'] = 'all';
  displayedColumns = ['id','name','status','assigned','location','due','actions'];

  constructor(private mock: MockDataService) {
    this.assets = this.mock.getAssets();
    this.categories = Array.from(new Set(this.assets.map(a => a.category)));
    this.applyFilters();
  }

  statusColor(status: AssetItem['status']) {
    if (status === 'maintenance') return 'warn';
    if (status === 'assigned') return 'accent';
    return 'primary';
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered = this.assets.filter(a => {
      const matchesTerm = !term || [a.name, a.id, a.assignedTo, a.location, a.category].some(v => (v || '').toLowerCase().includes(term));
      const matchesCat = this.category === 'all' || a.category === this.category;
      const matchesStatus = this.status === 'all' || a.status === this.status;
      return matchesTerm && matchesCat && matchesStatus;
    });
  }

  toggleAssign(row: AssetItem) {
    if (row.status === 'assigned') {
      this.mock.updateAsset(row.id, { status: 'available', assignedTo: undefined, assignedType: undefined, dueDate: undefined });
    } else {
      this.mock.updateAsset(row.id, { status: 'assigned', assignedTo: 'Student', assignedType: 'student', dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10) });
    }
    this.assets = this.mock.getAssets();
    this.applyFilters();
  }

  addAsset() {
    this.mock.addAsset({ name: 'New Asset', category: 'General', status: 'available', location: 'Store' });
    this.assets = this.mock.getAssets();
    this.categories = Array.from(new Set(this.assets.map(a => a.category)));
    this.applyFilters();
  }
}
