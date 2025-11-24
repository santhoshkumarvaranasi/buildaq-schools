import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, Announcement } from '../../core/services/mock-data.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./announcements.scss'],
  template: `
    <div class="announcements mat-typography">
      <div class="hero mat-elevation-z2">
        <div>
          <div class="eyebrow">School Management</div>
          <div class="title">Announcements</div>
        </div>
        <div class="hero-actions">
          <button mat-stroked-button color="primary" (click)="exportCsv()">Export CSV</button>
          <button mat-flat-button color="accent" (click)="openDialog()">
            <span class="icon">+</span>
            New announcement
          </button>
        </div>
      </div>

      <mat-card class="filters">
        <div class="filter-grid">
          <mat-form-field appearance="fill">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="title or body" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Audience</mat-label>
            <mat-select [(ngModel)]="audience" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="students">Students</mat-option>
              <mat-option value="teachers">Teachers</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Priority</mat-label>
            <mat-select [(ngModel)]="priority" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="low">Low</mat-option>
              <mat-option value="normal">Normal</mat-option>
              <mat-option value="high">High</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Start date</mat-label>
            <input matInput type="date" [(ngModel)]="startDate" (change)="applyFilters()" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>End date</mat-label>
            <input matInput type="date" [(ngModel)]="endDate" (change)="applyFilters()" />
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <div class="table-title">Recent announcements</div>
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered" class="mat-elevation-z2 mat-table">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-strong">{{ row.title }}</div>
                <div class="cell-sub">{{ row.body }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="audience">
              <th mat-header-cell *matHeaderCellDef>Audience</th>
              <td mat-cell *matCellDef="let row">{{ row.audience }}</td>
            </ng-container>
            <ng-container matColumnDef="priority">
              <th mat-header-cell *matHeaderCellDef>Priority</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="priorityColor(row.priority)" selected>{{ row.priority }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let row">{{ row.date }}</td>
            </ng-container>
            <ng-container matColumnDef="author">
              <th mat-header-cell *matHeaderCellDef>Author</th>
              <td mat-cell *matCellDef="let row">{{ row.author }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">No announcements match your filters.</td>
            </tr>
          </table>
        </div>
      </mat-card>
    </div>

    <ng-template #announceDialog let-dialogRef>
      <h2 mat-dialog-title>New announcement</h2>
      <mat-dialog-content class="dialog-content">
        <div class="dialog-grid">
          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input matInput [(ngModel)]="form.title" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Audience</mat-label>
            <mat-select [(ngModel)]="form.audience">
              <mat-option value="all">All</mat-option>
              <mat-option value="students">Students</mat-option>
              <mat-option value="teachers">Teachers</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select [(ngModel)]="form.priority">
              <mat-option value="low">Low</mat-option>
              <mat-option value="normal">Normal</mat-option>
              <mat-option value="high">High</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input matInput type="date" [(ngModel)]="form.date" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Author</mat-label>
            <input matInput [(ngModel)]="form.author" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-row">
            <mat-label>Body</mat-label>
            <textarea matInput rows="3" [(ngModel)]="form.body"></textarea>
          </mat-form-field>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">Cancel</button>
        <button mat-flat-button color="primary" (click)="save(dialogRef)" [disabled]="!form.title">Save</button>
      </mat-dialog-actions>
    </ng-template>
  `
})
export class AnnouncementsComponent {
  @ViewChild('announceDialog') announceDialog!: TemplateRef<any>;

  announcements: Announcement[] = [];
  filtered: Announcement[] = [];
  displayedColumns = ['title', 'audience', 'priority', 'date', 'author'];
  search = '';
  audience: 'all' | 'students' | 'teachers' = 'all';
  priority: 'all' | 'low' | 'normal' | 'high' = 'all';
  startDate = '';
  endDate = '';
  form: any = {};

  constructor(private mock: MockDataService, private dialog: MatDialog) {
    this.refresh();
  }

  refresh() {
    this.announcements = this.mock.getAnnouncements() || [];
    this.applyFilters();
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;
    this.filtered = this.announcements.filter(a => {
      const matchesTerm = !term || [a.title, a.body, a.author].some(v => (v || '').toLowerCase().includes(term));
      const matchesAudience = this.audience === 'all' || a.audience === this.audience;
      const matchesPriority = this.priority === 'all' || a.priority === this.priority;
      const dt = new Date(a.date);
      const matchesStart = !start || dt >= start;
      const matchesEnd = !end || dt <= end;
      return matchesTerm && matchesAudience && matchesPriority && matchesStart && matchesEnd;
    });
  }

  priorityColor(p: string) {
    if (p === 'high') return 'warn';
    if (p === 'normal') return 'primary';
    return 'accent';
  }

  openDialog() {
    const today = new Date().toISOString().slice(0, 10);
    this.form = { title: '', audience: 'all', priority: 'normal', date: today, author: 'Admin', body: '' };
    this.dialog.open(this.announceDialog, { width: '520px' });
  }

  save(ref: any) {
    this.mock.addAnnouncement(this.form);
    this.refresh();
    ref.close();
  }

  exportCsv() {
    const header = ['Title','Audience','Priority','Date','Author','Body'];
    const rows = this.filtered.map(a => [a.title, a.audience, a.priority, a.date, a.author, a.body]);
    const csv = [header, ...rows].map(r => r.map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'announcements.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
