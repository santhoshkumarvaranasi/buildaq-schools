import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, HealthIncident, HealthProfile } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./health.scss'],
  template: `
    <div class="fees-page health-page mat-typography">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">School Management</div>
          <div class="title">Health & Medical</div>
        </div>
        <span class="spacer"></span>
        <button mat-flat-button color="accent" class="record-btn" (click)="addIncident()">
          <span class="icon">+</span>
          Log incident
        </button>
      </mat-toolbar>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="student, symptom, condition" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Condition</mat-label>
            <mat-select [(ngModel)]="condition" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option *ngFor="let c of conditions" [value]="c">{{ c }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-checkbox [(ngModel)]="notifiedOnly" (change)="applyFilters()">Parent notified</mat-checkbox>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2 desktop-only">
        <mat-card-title>Health incidents</mat-card-title>
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered" class="mat-elevation-z2 mat-table">
            <ng-container matColumnDef="student">
              <th mat-header-cell *matHeaderCellDef>Student</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-strong">{{ row.studentName }}</div>
                <div class="cell-sub">{{ profile(row.studentId)?.conditions || '—' }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let row">{{ row.date }}</td>
            </ng-container>
            <ng-container matColumnDef="symptom">
              <th mat-header-cell *matHeaderCellDef>Symptom</th>
              <td mat-cell *matCellDef="let row">{{ row.symptom }}</td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let row">{{ row.actionTaken }}</td>
            </ng-container>
            <ng-container matColumnDef="notified">
              <th mat-header-cell *matHeaderCellDef>Notified</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="row.notifiedParent ? 'primary' : 'warn'" selected>
                  {{ row.notifiedParent ? 'Yes' : 'No' }}
                </mat-chip>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">No incidents match your filters.</td>
            </tr>
          </table>
        </div>
      </mat-card>

      <mat-card class="mobile-only mobile-card-list">
        <div class="mobile-card" *ngFor="let row of filtered">
          <div class="card-row">
            <div class="cell-strong">{{ row.studentName }}</div>
            <mat-chip [color]="row.notifiedParent ? 'primary' : 'warn'" selected>
              {{ row.notifiedParent ? 'Notified' : 'Pending' }}
            </mat-chip>
          </div>
          <div class="cell-sub">{{ profile(row.studentId)?.conditions || '—' }}</div>
          <div class="cell-sub">Symptom: {{ row.symptom }}</div>
          <div class="cell-sub">Action: {{ row.actionTaken }}</div>
          <div class="cell-sub">Date: {{ row.date }}</div>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2 desktop-only">
        <mat-card-title>Health profiles</mat-card-title>
        <div class="table-wrap">
          <table mat-table [dataSource]="profiles" class="mat-table">
            <ng-container matColumnDef="student">
              <th mat-header-cell *matHeaderCellDef>Student</th>
              <td mat-cell *matCellDef="let row">{{ studentName(row.studentId) }}</td>
            </ng-container>
            <ng-container matColumnDef="conditions">
              <th mat-header-cell *matHeaderCellDef>Conditions</th>
              <td mat-cell *matCellDef="let row">{{ row.conditions || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="allergies">
              <th mat-header-cell *matHeaderCellDef>Allergies</th>
              <td mat-cell *matCellDef="let row">{{ row.allergies || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="meds">
              <th mat-header-cell *matHeaderCellDef>Medications</th>
              <td mat-cell *matCellDef="let row">{{ row.medications || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="emergency">
              <th mat-header-cell *matHeaderCellDef>Emergency contact</th>
              <td mat-cell *matCellDef="let row">{{ row.emergencyContact || '—' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="profileCols"></tr>
            <tr mat-row *matRowDef="let row; columns: profileCols;"></tr>
          </table>
        </div>
      </mat-card>
    </div>
  `
})
export class HealthComponent {
  incidents: HealthIncident[] = [];
  filtered: HealthIncident[] = [];
  profiles: HealthProfile[] = [];
  students: any[] = [];
  conditions: string[] = [];
  search = '';
  condition = 'all';
  notifiedOnly = false;
  displayedColumns = ['student','date','symptom','action','notified'];
  profileCols = ['student','conditions','allergies','meds','emergency'];

  constructor(private mock: MockDataService) {
    this.students = this.mock.getStudents();
    this.incidents = mock.getHealthIncidents();
    this.profiles = mock.getHealthProfiles();
    this.conditions = Array.from(new Set(this.profiles.map(p => p.conditions || '').filter(Boolean)));
    this.applyFilters();
  }

  studentName(id: number) {
    const s = this.students.find(x => x.id === id);
    return s ? `${s.firstName} ${s.lastName}` : `ID ${id}`;
  }

  profile(studentId: number) {
    return this.profiles.find(p => p.studentId === studentId);
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered = this.incidents.filter(i => {
      const matchesTerm = !term || [i.studentName, i.symptom, i.actionTaken, (this.profile(i.studentId)?.conditions || '')]
        .some(v => (v || '').toLowerCase().includes(term));
      const matchesCondition = this.condition === 'all' || (this.profile(i.studentId)?.conditions || '') === this.condition;
      const matchesNotify = !this.notifiedOnly || i.notifiedParent;
      return matchesTerm && matchesCondition && matchesNotify;
    });
  }

  addIncident() {
    this.mock.addHealthIncident({ studentName: 'New Student', studentId: 0, symptom: 'Symptom', actionTaken: 'Logged', notifiedParent: false });
    this.incidents = this.mock.getHealthIncidents();
    this.applyFilters();
  }
}
