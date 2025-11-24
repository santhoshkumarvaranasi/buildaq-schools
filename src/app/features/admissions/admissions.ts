import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material.module';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-admissions',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./admissions.scss'],
  template: `
    <div class="admissions-page">
      <div class="admissions-hero mat-elevation-z2">
        <div class="hero-text">
          <div class="eyebrow">School Management</div>
          <div class="title">Admissions</div>
        </div>
        <button mat-flat-button color="accent" class="hero-action" (click)="refresh()">
          <span class="icon-wrap">+</span>
          Refresh
        </button>
      </div>

      <mat-card>
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
          <mat-form-field appearance="fill" style="flex:1 1 260px;">
            <mat-label>Search</mat-label>
            <span matPrefix class="icon-wrap">🔍</span>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="name or class" />
          </mat-form-field>
          <mat-chip-listbox [value]="statusFilter" (selectionChange)="onStatusChange($event)">
            <mat-chip-option value="all">All</mat-chip-option>
            <mat-chip-option value="new">New</mat-chip-option>
            <mat-chip-option value="verified">Verified</mat-chip-option>
            <mat-chip-option value="rejected">Rejected</mat-chip-option>
          </mat-chip-listbox>
        </div>
      </mat-card>

      <mat-card>
        <mat-card-title>Admissions queue</mat-card-title>
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered" class="mat-elevation-z1" style="width:100%;">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let row">{{ row.name }}</td>
            </ng-container>
            <ng-container matColumnDef="class">
              <th mat-header-cell *matHeaderCellDef>Class</th>
              <td mat-cell *matCellDef="let row">{{ row.class }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="row.status === 'verified' ? 'primary' : row.status === 'rejected' ? 'warn' : undefined" selected>
                  {{ row.status }}
                </mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="submitted">
              <th mat-header-cell *matHeaderCellDef>Submitted</th>
              <td mat-cell *matCellDef="let row">{{ row.submitted }}</td>
            </ng-container>
            <ng-container matColumnDef="notes">
              <th mat-header-cell *matHeaderCellDef>Notes</th>
              <td mat-cell *matCellDef="let row">{{ row.notes || '--' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-stroked-button color="primary" (click)="update(row,'verified')">Verify</button>
                <button mat-stroked-button color="warn" (click)="update(row,'rejected')">Reject</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">No admissions match your filters.</td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>
  `
})
export class AdmissionsComponent {
  admissions: any[] = [];
  filtered: any[] = [];
  displayedColumns = ['name','class','status','submitted','notes','actions'];
  search = '';
  statusFilter: 'all' | 'new' | 'verified' | 'rejected' = 'all';

  constructor(private mock: MockDataService) {
    this.refresh();
  }

  refresh() {
    this.admissions = this.mock.getAdmissions();
    this.applyFilters();
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered = this.admissions.filter(a => {
      const matchesTerm = !term || a.name.toLowerCase().includes(term) || (a.class || '').toLowerCase().includes(term);
      const matchesStatus = this.statusFilter === 'all' || a.status === this.statusFilter;
      return matchesTerm && matchesStatus;
    });
  }

  onStatusChange(event: any) {
    const val = event && 'value' in event ? event.value : null;
    this.statusFilter = val || 'all';
    this.applyFilters();
  }

  update(row: any, status: string) {
    this.mock.updateAdmission(row.id, status);
    this.refresh();
  }
}
