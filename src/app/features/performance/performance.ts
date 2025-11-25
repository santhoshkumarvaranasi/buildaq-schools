import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, TeacherGoal, TeacherFeedback, TeacherPd } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./performance.scss'],
  template: `
    <div class="fees-page performance-page mat-typography">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">School Management</div>
          <div class="title">Staff Performance & Goals</div>
        </div>
      </mat-toolbar>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="teacher or goal" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="status" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="on-track">On track</mat-option>
              <mat-option value="at-risk">At risk</mat-option>
              <mat-option value="completed">Completed</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2 desktop-only">
        <mat-card-title>Goals</mat-card-title>
        <div class="table-wrap">
          <table mat-table [dataSource]="filteredGoals" class="mat-elevation-z2 mat-table">
            <ng-container matColumnDef="teacher">
              <th mat-header-cell *matHeaderCellDef>Teacher</th>
              <td mat-cell *matCellDef="let row">{{ row.teacherName }}</td>
            </ng-container>
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Goal</th>
              <td mat-cell *matCellDef="let row">{{ row.title }}</td>
            </ng-container>
            <ng-container matColumnDef="due">
              <th mat-header-cell *matHeaderCellDef>Due</th>
              <td mat-cell *matCellDef="let row">{{ row.dueDate }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="statusColor(row.status)" selected>{{ row.status }}</mat-chip>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="goalCols"></tr>
            <tr mat-row *matRowDef="let row; columns: goalCols;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="goalCols.length">No goals match your filters.</td>
            </tr>
          </table>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2 desktop-only">
        <mat-card-title>Feedback</mat-card-title>
        <div class="table-wrap">
          <table mat-table [dataSource]="feedback" class="mat-table">
            <ng-container matColumnDef="teacher">
              <th mat-header-cell *matHeaderCellDef>Teacher</th>
              <td mat-cell *matCellDef="let row">{{ row.teacherName }}</td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let row">{{ row.date }}</td>
            </ng-container>
            <ng-container matColumnDef="observer">
              <th mat-header-cell *matHeaderCellDef>Observer</th>
              <td mat-cell *matCellDef="let row">{{ row.observer }}</td>
            </ng-container>
            <ng-container matColumnDef="summary">
              <th mat-header-cell *matHeaderCellDef>Summary</th>
              <td mat-cell *matCellDef="let row">{{ row.summary }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="feedbackCols"></tr>
            <tr mat-row *matRowDef="let row; columns: feedbackCols;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="feedbackCols.length">No feedback logged.</td>
            </tr>
          </table>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2 desktop-only">
        <mat-card-title>Professional Development</mat-card-title>
        <div class="table-wrap">
          <table mat-table [dataSource]="pd" class="mat-table">
            <ng-container matColumnDef="teacher">
              <th mat-header-cell *matHeaderCellDef>Teacher</th>
              <td mat-cell *matCellDef="let row">{{ row.teacherName }}</td>
            </ng-container>
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Course</th>
              <td mat-cell *matCellDef="let row">{{ row.title }}</td>
            </ng-container>
            <ng-container matColumnDef="hours">
              <th mat-header-cell *matHeaderCellDef>Hours</th>
              <td mat-cell *matCellDef="let row">{{ row.hours }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="pdColor(row.status)" selected>{{ row.status }}</mat-chip>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="pdCols"></tr>
            <tr mat-row *matRowDef="let row; columns: pdCols;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="pdCols.length">No professional development records.</td>
            </tr>
          </table>
        </div>
      </mat-card>

      <mat-card class="mobile-only mobile-card-list">
        <div class="mobile-card" *ngFor="let row of filteredGoals">
          <div class="card-row">
            <div class="cell-strong">{{ row.teacherName }}</div>
            <mat-chip [color]="statusColor(row.status)" selected>{{ row.status }}</mat-chip>
          </div>
          <div class="cell-sub">{{ row.title }}</div>
          <div class="cell-sub">Due: {{ row.dueDate }}</div>
        </div>
      </mat-card>
    </div>
  `
})
export class PerformanceComponent {
  goals: TeacherGoal[] = [];
  filteredGoals: TeacherGoal[] = [];
  feedback: TeacherFeedback[] = [];
  pd: TeacherPd[] = [];
  search = '';
  status: 'all' | TeacherGoal['status'] = 'all';
  goalCols = ['teacher','title','due','status'];
  feedbackCols = ['teacher','date','observer','summary'];
  pdCols = ['teacher','title','hours','status'];

  constructor(private mock: MockDataService) {
    this.goals = mock.getTeacherGoals();
    this.feedback = mock.getTeacherFeedback();
    this.pd = mock.getTeacherPd();
    this.applyFilters();
  }

  statusColor(s: string) {
    if (s === 'at-risk') return 'warn';
    if (s === 'completed') return 'accent';
    return 'primary';
  }

  pdColor(s: string) {
    if (s === 'completed') return 'primary';
    if (s === 'in-progress') return 'accent';
    return 'warn';
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filteredGoals = this.goals.filter(g => {
      const matchesTerm = !term || [g.teacherName, g.title].some(v => (v || '').toLowerCase().includes(term));
      const matchesStatus = this.status === 'all' || g.status === this.status;
      return matchesTerm && matchesStatus;
    });
  }
}
