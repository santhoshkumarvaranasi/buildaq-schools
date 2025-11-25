import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, Club } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./clubs.scss'],
  template: `
    <div class="fees-page clubs-page mat-typography">
      <mat-toolbar color="primary" class="fees-toolbar mat-elevation-z2">
        <div class="toolbar-left">
          <div class="eyebrow">School Management</div>
          <div class="title">Clubs & Activities</div>
        </div>
        <span class="spacer"></span>
        <button mat-flat-button color="accent" class="record-btn" (click)="addClub()">
          <span class="icon">+</span> Add club
        </button>
      </mat-toolbar>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="name, advisor, category" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="category" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option *ngFor="let c of categories" [value]="c">{{ c }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Meeting day</mat-label>
            <mat-select [(ngModel)]="meetingDay" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option *ngFor="let d of days" [value]="d">{{ d }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <div class="grid desktop-only">
        <mat-card class="club-card mat-elevation-z2" *ngFor="let club of filtered">
          <div class="card-head">
            <div>
              <div class="club-name">{{ club.name }}</div>
              <div class="club-meta">{{ club.category || 'General' }}</div>
            </div>
            <mat-chip color="primary" selected>{{ club.meetingDay }}</mat-chip>
          </div>
          <div class="club-body">
            <div><strong>Advisor:</strong> {{ club.advisor }}</div>
            <div><strong>Members:</strong> {{ club.members }}</div>
            <div><strong>Next event:</strong> {{ club.nextEvent || '--' }}</div>
          </div>
        </mat-card>
      </div>

      <div class="mobile-only mobile-card-list">
        <div class="mobile-card" *ngFor="let club of filtered">
          <div class="card-row">
            <div class="cell-title">{{ club.name }}</div>
            <mat-chip color="primary" selected>{{ club.meetingDay }}</mat-chip>
          </div>
          <div class="cell-meta">{{ club.category || 'General' }}</div>
          <div class="cell-meta">Advisor: {{ club.advisor }}</div>
          <div class="cell-meta">Members: {{ club.members }}</div>
          <div class="cell-meta">Next: {{ club.nextEvent || '--' }}</div>
        </div>
      </div>
    </div>
  `
})
export class ClubsComponent {
  clubs: Club[] = [];
  filtered: Club[] = [];
  categories: string[] = [];
  days = ['Mon','Tue','Wed','Thu','Fri','Sat'];
  search = '';
  category: string = 'all';
  meetingDay: string = 'all';

  constructor(private mock: MockDataService) {
    this.clubs = this.mock.getClubs();
    this.categories = Array.from(new Set(this.clubs.map(c => c.category || '').filter(Boolean)));
    this.applyFilters();
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered = this.clubs.filter(c => {
      const matchesTerm = !term || [c.name, c.advisor, c.category].some(v => (v || '').toLowerCase().includes(term));
      const matchesCategory = this.category === 'all' || c.category === this.category;
      const matchesDay = this.meetingDay === 'all' || c.meetingDay === this.meetingDay;
      return matchesTerm && matchesCategory && matchesDay;
    });
  }

  addClub() {
    this.mock.addClub({ name: 'New Club', advisor: 'Advisor', meetingDay: 'Mon', members: 0 });
    this.clubs = this.mock.getClubs();
    this.categories = Array.from(new Set(this.clubs.map(c => c.category || '').filter(Boolean)));
    this.applyFilters();
  }
}
