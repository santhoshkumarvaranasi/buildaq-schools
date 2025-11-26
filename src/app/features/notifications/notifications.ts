import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, NotificationItem } from '../../core/services/mock-data.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, RouterLink],
  styleUrls: ['./notifications.scss'],
  template: `
    <div class="notifications-page mat-typography">
      <div class="hero mat-elevation-z2">
        <div class="hero-text">
          <div class="eyebrow">School Management</div>
          <div class="title">Notifications Center</div>
          <div class="subtitle">Stay on top of fees, attendance, behavior, and events</div>
        </div>
        <div class="hero-actions">
          <button mat-flat-button color="primary" (click)="markAllRead()">Mark all read</button>
        </div>
      </div>

      <mat-card class="filters-card mat-elevation-z2">
        <div class="filter-grid">
          <mat-form-field appearance="fill">
            <mat-label>Filter by type</mat-label>
            <mat-select [(ngModel)]="typeFilter" (selectionChange)="applyFilters()">
              <mat-option value="all">All</mat-option>
              <mat-option value="fee">Fees</mat-option>
              <mat-option value="attendance">Attendance</mat-option>
              <mat-option value="behavior">Behavior</mat-option>
              <mat-option value="coverage">Coverage</mat-option>
              <mat-option value="event">Events</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-checkbox [(ngModel)]="unreadOnly" (change)="applyFilters()">Unread only</mat-checkbox>
        </div>
      </mat-card>

      <div class="cards-grid">
        <mat-card class="notif-card mat-elevation-z2 fade-in" *ngFor="let n of filtered">
          <div class="card-row">
            <mat-chip [color]="chipColor(n.priority)" selected>{{ n.type }}</mat-chip>
            <div class="pill" [ngClass]="{'pill-unread': n.unread}">{{ n.unread ? 'Unread' : 'Read' }}</div>
          </div>
          <div class="notif-title">{{ n.title }}</div>
          <div class="notif-body">{{ n.message }}</div>
          <div class="notif-meta">Date: {{ n.date }}</div>
          <div class="action-row">
            <button mat-stroked-button color="primary" class="ghost-button" (click)="markRead(n)">Mark read</button>
            <a *ngIf="n.link" [routerLink]="n.link" class="ghost-link">Open</a>
          </div>
        </mat-card>
      </div>
    </div>
  `
})
export class NotificationsComponent {
  notifications: NotificationItem[] = [];
  filtered: NotificationItem[] = [];
  typeFilter: 'all' | NotificationItem['type'] = 'all';
  unreadOnly = false;

  constructor(private mock: MockDataService) {
    this.notifications = mock.getNotifications();
    this.applyFilters();
  }

  chipColor(priority: string | undefined) {
    if (priority === 'high') return 'warn';
    if (priority === 'low') return 'accent';
    return 'primary';
  }

  applyFilters() {
    this.filtered = this.notifications.filter(n => {
      const matchesType = this.typeFilter === 'all' || n.type === this.typeFilter;
      const matchesUnread = !this.unreadOnly || !!n.unread;
      return matchesType && matchesUnread;
    });
  }

  markRead(n: NotificationItem) {
    this.mock.updateNotification(n.id, { unread: false });
    this.notifications = this.mock.getNotifications();
    this.applyFilters();
  }

  markAllRead() {
    this.notifications.forEach(n => this.mock.updateNotification(n.id, { unread: false }));
    this.notifications = this.mock.getNotifications();
    this.applyFilters();
  }
}
