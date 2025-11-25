import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, ParentContact } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-parents',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./parents.scss'],
  template: `
    <div class="fees-page parents-page mat-typography">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">School Management</div>
          <div class="title">Parents & Messaging</div>
        </div>
        <span class="spacer"></span>
        <button mat-flat-button color="accent" class="record-btn" (click)="addParent()">
          <span class="icon">+</span> Add parent
        </button>
      </mat-toolbar>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="name, student, email" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Channel</mat-label>
            <mat-select [(ngModel)]="channel" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="email">Email</mat-option>
              <mat-option value="sms">SMS</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2 desktop-only">
        <mat-card-title>Parent directory</mat-card-title>
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered" class="fees-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-title">{{ row.name }}</div>
                <div class="cell-meta">Prefers: {{ row.preferredChannel || 'email' }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="students">
              <th mat-header-cell *matHeaderCellDef>Students</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-meta" *ngFor="let s of studentNames(row.studentIds)">{{ s }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="contact">
              <th mat-header-cell *matHeaderCellDef>Contact</th>
              <td mat-cell *matCellDef="let row">
                <div>{{ row.email || '--' }}</div>
                <div class="cell-meta">{{ row.phone || '--' }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="lastContact">
              <th mat-header-cell *matHeaderCellDef>Last contact</th>
              <td mat-cell *matCellDef="let row">{{ row.lastContact || '--' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-stroked-button color="primary" class="ghost-button" (click)="sendMessage(row)">Message</button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="empty-state" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length"><div class="fee-empty">No parents match your filters.</div></td>
            </tr>
          </table>
        </div>
      </mat-card>

      <mat-card class="mobile-only mobile-card-list">
        <div class="mobile-card" *ngFor="let row of filtered">
          <div class="card-row">
            <div class="cell-title">{{ row.name }}</div>
            <mat-chip color="primary" selected>{{ row.preferredChannel || 'email' }}</mat-chip>
          </div>
          <div class="cell-meta">Students: {{ studentNames(row.studentIds).join(', ') || '--' }}</div>
          <div class="cell-meta">Email: {{ row.email || '--' }}</div>
          <div class="cell-meta">Phone: {{ row.phone || '--' }}</div>
          <div class="cell-meta">Last contact: {{ row.lastContact || '--' }}</div>
          <div class="action-row">
            <button mat-stroked-button color="primary" (click)="sendMessage(row)">Message</button>
          </div>
        </div>
      </mat-card>
    </div>
  `
})
export class ParentsComponent {
  parents: ParentContact[] = [];
  filtered: ParentContact[] = [];
  studentsMap = new Map<number, string>();
  search = '';
  channel: 'all' | 'email' | 'sms' = 'all';
  displayedColumns = ['name','students','contact','lastContact','actions'];

  constructor(private mock: MockDataService) {
    const students = mock.getStudents();
    students.forEach(s => this.studentsMap.set(s.id, `${s.firstName} ${s.lastName}`));
    this.parents = mock.getParents();
    this.applyFilters();
  }

  studentNames(ids: number[]) {
    return (ids || []).map(id => this.studentsMap.get(id) || `ID ${id}`);
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered = this.parents.filter(p => {
      const matchesTerm = !term || [p.name, p.email, p.phone].some(v => (v || '').toLowerCase().includes(term)) ||
        this.studentNames(p.studentIds).some(n => n.toLowerCase().includes(term));
      const matchesChannel = this.channel === 'all' || p.preferredChannel === this.channel;
      return matchesTerm && matchesChannel;
    });
  }

  addParent() {
    this.mock.addParent({ name: 'New Parent', email: 'parent@example.com', preferredChannel: 'email' });
    this.parents = this.mock.getParents();
    this.applyFilters();
  }

  sendMessage(row: ParentContact) {
    row.lastContact = new Date().toISOString().slice(0,10);
    this.applyFilters();
  }
}
