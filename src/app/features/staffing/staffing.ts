import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, CoverageRequest, MockStaff } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-staffing',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./staffing.scss'],
  template: `
    <div class="fees-page staffing-page mat-typography">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">School Management</div>
          <div class="title">Staff Directory & Coverage</div>
        </div>
      </mat-toolbar>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill">
            <mat-label>Search staff</mat-label>
            <input matInput [(ngModel)]="staffSearch" (ngModelChange)="filterStaff()" placeholder="name or role" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Coverage status</mat-label>
            <mat-select [(ngModel)]="coverageStatus" (selectionChange)="filterCoverage()">
              <mat-option value="all">All</mat-option>
              <mat-option value="open">Open</mat-option>
              <mat-option value="assigned">Assigned</mat-option>
              <mat-option value="closed">Closed</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <div class="cards-grid">
        <mat-card class="staff-card mat-elevation-z2" *ngFor="let s of filteredStaff" [class.fade-in]="true">
          <div class="card-row">
            <div>
              <div class="staff-name">{{ s.name }}</div>
              <div class="staff-role">{{ s.role }}</div>
            </div>
            <mat-chip color="primary" selected>{{ s.email || '—' }}</mat-chip>
          </div>
          <div class="card-meta">Phone: {{ s.phone || '—' }}</div>
        </mat-card>
      </div>

      <mat-card class="table-card mat-elevation-z2 desktop-only">
        <mat-card-title>Coverage requests</mat-card-title>
        <div class="table-wrap">
          <table mat-table [dataSource]="filteredCoverage" class="mat-elevation-z2 mat-table">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let row">{{ row.date }}</td>
            </ng-container>
            <ng-container matColumnDef="class">
              <th mat-header-cell *matHeaderCellDef>Class</th>
              <td mat-cell *matCellDef="let row">{{ row.classId }}</td>
            </ng-container>
            <ng-container matColumnDef="subject">
              <th mat-header-cell *matHeaderCellDef>Subject</th>
              <td mat-cell *matCellDef="let row">{{ row.subject }}</td>
            </ng-container>
            <ng-container matColumnDef="requester">
              <th mat-header-cell *matHeaderCellDef>Requester</th>
              <td mat-cell *matCellDef="let row">{{ row.requester }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="statusColor(row.status)" selected>{{ row.status }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-stroked-button color="primary" class="ghost-button" (click)="assign(row)">Assign</button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="coverageCols"></tr>
            <tr mat-row *matRowDef="let row; columns: coverageCols;"></tr>
          </table>
        </div>
      </mat-card>

      <mat-card class="mobile-only mobile-card-list">
        <div class="mobile-card fade-in" *ngFor="let row of filteredCoverage">
          <div class="card-row">
            <div class="cell-strong">{{ row.classId }} · {{ row.subject }}</div>
            <mat-chip [color]="statusColor(row.status)" selected>{{ row.status }}</mat-chip>
          </div>
          <div class="cell-sub">{{ row.date }} · {{ row.period }}</div>
          <div class="cell-sub">Requester: {{ row.requester }}</div>
          <div class="cell-sub">Sub: {{ row.substitute || 'Unassigned' }}</div>
        </div>
      </mat-card>
    </div>
  `
})
export class StaffingComponent {
  staff: MockStaff[] = [];
  filteredStaff: MockStaff[] = [];
  coverage: CoverageRequest[] = [];
  filteredCoverage: CoverageRequest[] = [];
  coverageCols = ['date','class','subject','requester','status','actions'];
  staffSearch = '';
  coverageStatus: 'all' | CoverageRequest['status'] = 'all';

  constructor(private mock: MockDataService) {
    this.staff = mock.getStaff();
    this.coverage = mock.getCoverageRequests();
    this.filterStaff();
    this.filterCoverage();
  }

  filterStaff() {
    const term = this.staffSearch.trim().toLowerCase();
    this.filteredStaff = this.staff.filter(s =>
      !term || [s.name, s.role, s.email, s.phone].some(v => (v || '').toLowerCase().includes(term))
    );
  }

  filterCoverage() {
    this.filteredCoverage = this.coverage.filter(c =>
      (this.coverageStatus === 'all' || c.status === this.coverageStatus)
    );
  }

  statusColor(status: string) {
    if (status === 'open') return 'warn';
    if (status === 'assigned') return 'accent';
    return 'primary';
  }

  assign(row: CoverageRequest) {
    this.mock.updateCoverage(row.id, { status: 'assigned', substitute: 'Available staff' });
    this.coverage = this.mock.getCoverageRequests();
    this.filterCoverage();
  }
}
