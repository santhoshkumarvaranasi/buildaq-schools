import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, TransportRoute } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-transport',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./transport.scss'],
  template: `
    <div class="transport mat-typography">
      <div class="hero mat-elevation-z2">
        <div>
          <div class="eyebrow">School Management</div>
          <div class="title">Transport</div>
        </div>
        <div class="hero-actions">
          <button mat-stroked-button color="primary" (click)="exportCsv()">Export CSV</button>
        </div>
      </div>

      <mat-card class="filters">
        <div class="filter-grid">
          <mat-form-field appearance="fill">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="route, driver, note" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="status" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="on-time">On time</mat-option>
              <mat-option value="delayed">Delayed</mat-option>
              <mat-option value="maintenance">Maintenance</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Driver</mat-label>
            <mat-select [(ngModel)]="driver" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option *ngFor="let d of drivers" [value]="d">{{ d }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card desktop-only">
        <div class="table-title">Routes</div>
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered" class="mat-elevation-z2 mat-table">
            <ng-container matColumnDef="route">
              <th mat-header-cell *matHeaderCellDef>Route</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-strong">{{ row.routeName }}</div>
                <div class="cell-sub">Driver: {{ row.driver }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="times">
              <th mat-header-cell *matHeaderCellDef>Times</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-strong">Depart {{ row.departure }}</div>
                <div class="cell-sub">Return {{ row.returnTime }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="capacity">
              <th mat-header-cell *matHeaderCellDef>Capacity</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-strong">{{ row.assigned }}/{{ row.capacity }}</div>
                <mat-progress-bar mode="determinate" [value]="utilization(row)"></mat-progress-bar>
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="statusColor(row.status)" selected>{{ row.status }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="notes">
              <th mat-header-cell *matHeaderCellDef>Notes</th>
              <td mat-cell *matCellDef="let row">{{ row.notes || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-stroked-button color="primary" (click)="setStatus(row,'on-time')">On time</button>
                <button mat-stroked-button color="accent" (click)="setStatus(row,'delayed')">Delay</button>
                <button mat-stroked-button color="warn" (click)="setStatus(row,'maintenance')">Maintenance</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">No routes match your filters.</td>
            </tr>
          </table>
        </div>
      </mat-card>

      <mat-card class="mobile-only mobile-card-list">
        <div class="mobile-card" *ngFor="let row of filtered">
          <div class="card-row">
            <div>
              <div class="cell-strong">{{ row.routeName }}</div>
              <div class="cell-sub">Driver: {{ row.driver }}</div>
            </div>
            <mat-chip [color]="statusColor(row.status)" selected>{{ row.status }}</mat-chip>
          </div>
          <div class="cell-sub">Depart {{ row.departure }} · Return {{ row.returnTime }}</div>
          <div class="cell-sub">Capacity: {{ row.assigned }}/{{ row.capacity }}</div>
          <div class="cell-sub">Notes: {{ row.notes || '—' }}</div>
          <div class="action-row">
            <button mat-stroked-button color="primary" (click)="setStatus(row,'on-time')">On time</button>
            <button mat-stroked-button color="accent" (click)="setStatus(row,'delayed')">Delay</button>
            <button mat-stroked-button color="warn" (click)="setStatus(row,'maintenance')">Maintenance</button>
          </div>
        </div>
      </mat-card>
    </div>
  `
})
export class TransportComponent {
  routes: TransportRoute[] = [];
  filtered: TransportRoute[] = [];
  drivers: string[] = [];
  displayedColumns = ['route', 'times', 'capacity', 'status', 'notes', 'actions'];
  search = '';
  status: 'all' | TransportRoute['status'] = 'all';
  driver: string = 'all';

  constructor(private mock: MockDataService) {
    this.refresh();
  }

  refresh() {
    this.routes = this.mock.getTransportRoutes() || [];
    this.drivers = Array.from(new Set(this.routes.map(r => r.driver).filter(Boolean)));
    this.applyFilters();
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered = this.routes.filter(r => {
      const matchesTerm = !term || [r.routeName, r.driver, r.notes].some(v => (v || '').toLowerCase().includes(term));
      const matchesStatus = this.status === 'all' || r.status === this.status;
      const matchesDriver = this.driver === 'all' || r.driver === this.driver;
      return matchesTerm && matchesStatus && matchesDriver;
    });
  }

  utilization(row: TransportRoute) {
    if (!row.capacity) return 0;
    return Math.min(100, Math.round((row.assigned / row.capacity) * 100));
  }

  statusColor(status: TransportRoute['status']) {
    if (status === 'on-time') return 'primary';
    if (status === 'delayed') return 'accent';
    return 'warn';
  }

  setStatus(row: TransportRoute, status: TransportRoute['status']) {
    this.mock.updateRouteStatus(row.id, status);
    this.refresh();
  }

  exportCsv() {
    const header = ['Route','Driver','Departure','Return','Capacity','Assigned','Status','Notes'];
    const rows = this.filtered.map(r => [r.routeName, r.driver, r.departure, r.returnTime, r.capacity, r.assigned, r.status, r.notes || '']);
    const csv = [header, ...rows].map(r => r.map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transport-routes.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
