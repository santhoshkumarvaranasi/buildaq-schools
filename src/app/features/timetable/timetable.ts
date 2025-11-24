import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { MaterialModule } from '../../core/material.module';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./timetable.scss'],
  template: `
    <div class="students-container timetable-root">
      <div class="students-header">
        <h2>Timetable</h2>
        <div class="students-count"><p>Simple timetable view (mock)</p></div>
      </div>

      <div class="filters-section timetable-form">
        <mat-form-field appearance="outline" class="filter-group">
          <mat-label>Class</mat-label>
          <mat-select [(ngModel)]="newEntry.classId">
            <mat-option *ngFor="let c of classes" [value]="c.id">{{c.name}}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-group">
          <mat-label>Subject</mat-label>
          <input matInput [(ngModel)]="newEntry.subject" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-group">
          <mat-label>Teacher</mat-label>
          <input matInput [(ngModel)]="newEntry.teacher" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-group">
          <mat-label>Day</mat-label>
          <input matInput [(ngModel)]="newEntry.day" placeholder="Mon/Tue" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-group">
          <mat-label>Time</mat-label>
          <input matInput [(ngModel)]="newEntry.time" placeholder="HH:MM" />
        </mat-form-field>

        <div class="filter-actions"><button mat-raised-button color="primary" (click)="addEntry()">Add</button></div>
      </div>

      <div class="timetable-grid">
        <div *ngFor="let t of timetable" class="timetable-card">
          <h4>{{t.classId}} • {{t.subject}}</h4>
          <div class="timetable-row"><div>{{t.day}}</div><div>{{t.time}}</div></div>
          <div class="card-actions">
            <button mat-stroked-button color="warn" (click)="deleteEntry(t.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TimetableComponent {
  classes: any[] = [];
  timetable: any[] = [];
  newEntry: any = { classId: '', subject: '', teacher: '', day: '', time: '' };

  constructor(private mock: MockDataService) { this.classes = mock.getClasses(); this.timetable = mock.getTimetable(); }

  addEntry() {
    if (!this.newEntry.classId || !this.newEntry.subject) return;
    this.mock.addTimetableEntry(Object.assign({}, this.newEntry));
    this.timetable = this.mock.getTimetable();
    this.newEntry = { classId: '', subject: '', teacher: '', day: '', time: '' };
  }

  deleteEntry(id: number) {
    this.mock.deleteTimetableEntry(id);
    this.timetable = this.mock.getTimetable();
  }
}
