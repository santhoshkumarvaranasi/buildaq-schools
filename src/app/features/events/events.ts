import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, EventItem } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./events.scss'],
  template: `
    <div class="fees-page events-page mat-typography">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">School Management</div>
          <div class="title">Events & Calendar</div>
        </div>
        <span class="spacer"></span>
        <button mat-flat-button color="accent" class="record-btn" (click)="addEvent()">
          <span class="icon">+</span>
          Add event
        </button>
      </mat-toolbar>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="title, location, audience" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Audience</mat-label>
            <mat-select [(ngModel)]="audience" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="students">Students</mat-option>
              <mat-option value="teachers">Teachers</mat-option>
              <mat-option value="parents">Parents</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="status" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="upcoming">Upcoming</mat-option>
              <mat-option value="completed">Completed</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card mat-elevation-z2 desktop-only">
        <mat-card-title>Events</mat-card-title>
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered" class="mat-elevation-z2 mat-table">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let row">
                <div class="cell-strong">{{ row.title }}</div>
                <div class="cell-sub">{{ row.category || 'General' }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let row">{{ row.date }} {{ row.time || '' }}</td>
            </ng-container>
            <ng-container matColumnDef="location">
              <th mat-header-cell *matHeaderCellDef>Location</th>
              <td mat-cell *matCellDef="let row">{{ row.location || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="audience">
              <th mat-header-cell *matHeaderCellDef>Audience</th>
              <td mat-cell *matCellDef="let row">{{ row.audience }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [color]="row.status === 'completed' ? 'accent' : 'primary'" selected>{{ row.status }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="rsvps">
              <th mat-header-cell *matHeaderCellDef>RSVPs</th>
              <td mat-cell *matCellDef="let row">{{ (row.rsvps || []).length }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="displayedColumns.length">No events match your filters.</td>
            </tr>
          </table>
        </div>
      </mat-card>

      <mat-card class="mobile-only mobile-card-list">
        <div class="mobile-card" *ngFor="let row of filtered">
          <div class="card-row">
            <div class="cell-strong">{{ row.title }}</div>
            <mat-chip color="primary" selected>{{ row.status || 'upcoming' }}</mat-chip>
          </div>
          <div class="cell-sub">{{ row.date }} {{ row.time || '' }} · {{ row.location || '—' }}</div>
          <div class="cell-sub">{{ row.category || 'General' }} · {{ row.audience }}</div>
          <div class="cell-sub">RSVPs: {{ (row.rsvps || []).length }}</div>
        </div>
      </mat-card>
    </div>
  `
})
export class EventsComponent {
  events: EventItem[] = [];
  filtered: EventItem[] = [];
  categories: string[] = [];
  search = '';
  audience: 'all' | EventItem['audience'] = 'all';
  status: 'all' | EventItem['status'] = 'all';
  displayedColumns = ['title','date','location','audience','status','rsvps'];

  constructor(private mock: MockDataService) {
    this.events = mock.getEvents();
    this.categories = Array.from(new Set(this.events.map(e => e.category || '').filter(Boolean)));
    this.applyFilters();
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered = this.events.filter(e => {
      const matchesTerm = !term || [e.title, e.location, e.category, e.audience].some(v => (v || '').toLowerCase().includes(term));
      const matchesAudience = this.audience === 'all' || e.audience === this.audience;
      const matchesStatus = this.status === 'all' || e.status === this.status;
      return matchesTerm && matchesAudience && matchesStatus;
    });
  }

  addEvent() {
    this.mock.addEvent({ title: 'New Event', date: new Date().toISOString().slice(0,10), audience: 'all', status: 'upcoming' });
    this.events = this.mock.getEvents();
    this.categories = Array.from(new Set(this.events.map(e => e.category || '').filter(Boolean)));
    this.applyFilters();
  }
}
