import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, ResourceItem, BookingItem } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./resources.scss'],
  template: `
    <div class="fees-page resources-page mat-typography">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">School Management</div>
          <div class="title">Resources & Bookings</div>
        </div>
        <span class="spacer"></span>
        <button mat-flat-button color="accent" class="record-btn" (click)="addBooking()">
          <span class="icon">+</span>
          New booking
        </button>
      </mat-toolbar>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="resource or requester" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="type" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="room">Room</mat-option>
              <mat-option value="lab">Lab</mat-option>
              <mat-option value="ground">Ground</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="status" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="approved">Approved</mat-option>
              <mat-option value="pending">Pending</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2 desktop-only">
        <mat-card-title>Bookings</mat-card-title>
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered" class="mat-elevation-z2 mat-table">
            <ng-container matColumnDef="resource">
              <th mat-header-cell *matHeaderCellDef>Resource</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-strong">{{ row.resourceName }}</div>
                <div class="cell-sub">{{ resourceType(row.resourceId) }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let row">{{ row.date }} {{ row.start }}-{{ row.end }}</td>
            </ng-container>
            <ng-container matColumnDef="requester">
              <th mat-header-cell *matHeaderCellDef>Requester</th>
              <td mat-cell *matCellDef="let row">{{ row.requester }}</td>
            </ng-container>
            <ng-container matColumnDef="purpose">
              <th mat-header-cell *matHeaderCellDef>Purpose</th>
              <td mat-cell *matCellDef="let row">{{ row.purpose }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="row.conflict ? 'warn' : row.status === 'approved' ? 'primary' : 'accent'" selected>
                  {{ row.conflict ? 'Conflict' : row.status }}
                </mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-stroked-button color="primary" class="ghost-button" (click)="approve(row)">Approve</button>
                <button mat-stroked-button color="warn" class="ghost-button" (click)="toggleConflict(row)">Toggle conflict</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">No bookings match your filters.</td>
            </tr>
          </table>
        </div>
      </mat-card>

      <mat-card class="mobile-only mobile-card-list">
        <div class="mobile-card" *ngFor="let row of filtered">
          <div class="card-row">
            <div class="cell-strong">{{ row.resourceName }}</div>
            <mat-chip [color]="row.conflict ? 'warn' : row.status === 'approved' ? 'primary' : 'accent'" selected>
              {{ row.conflict ? 'Conflict' : row.status }}
            </mat-chip>
          </div>
          <div class="cell-sub">{{ row.date }} {{ row.start }}-{{ row.end }}</div>
          <div class="cell-sub">Requester: {{ row.requester }}</div>
          <div class="cell-sub">Purpose: {{ row.purpose }}</div>
        </div>
      </mat-card>
    </div>
  `
})
export class ResourcesComponent {
  resources: ResourceItem[] = [];
  bookings: BookingItem[] = [];
  filtered: BookingItem[] = [];
  search = '';
  type: 'all' | ResourceItem['type'] = 'all';
  status: 'all' | BookingItem['status'] = 'all';
  displayedColumns = ['resource','date','requester','purpose','status','actions'];

  constructor(private mock: MockDataService) {
    this.resources = mock.getResources();
    this.bookings = mock.getBookings();
    this.applyFilters();
  }

  resourceType(resourceId: number) {
    const r = this.resources.find(x => x.id === resourceId);
    return r ? r.type : '';
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered = this.bookings.filter(b => {
      const matchesTerm = !term || [b.resourceName, b.requester, b.purpose].some(v => (v || '').toLowerCase().includes(term));
      const matchesType = this.type === 'all' || this.resourceType(b.resourceId) === this.type;
      const matchesStatus = this.status === 'all' || b.status === this.status;
      return matchesTerm && matchesType && matchesStatus;
    });
  }

  approve(row: BookingItem) {
    this.mock.updateBooking(row.id, { status: 'approved', conflict: false });
    this.bookings = this.mock.getBookings();
    this.applyFilters();
  }

  toggleConflict(row: BookingItem) {
    this.mock.updateBooking(row.id, { conflict: !row.conflict });
    this.bookings = this.mock.getBookings();
    this.applyFilters();
  }

  addBooking() {
    this.mock.addBooking({ resourceId: this.resources[0]?.id || 0, resourceName: this.resources[0]?.name || 'Room', requester: 'Requester', purpose: 'Meeting' });
    this.bookings = this.mock.getBookings();
    this.applyFilters();
  }
}
