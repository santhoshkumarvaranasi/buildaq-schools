import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./timetable.scss'],
  template: `
    <div class="students-container timetable-root">
      <div class="students-header">
        <h2>Timetable</h2>
        <div class="students-count"><p>Simple timetable view (mock)</p></div>
      </div>

      <div class="filters-section timetable-form">
        <label class="filter-group">Class
          <select class="form-select" [(ngModel)]="newEntry.classId">
            <option *ngFor="let c of classes" [value]="c.id">{{c.name}}</option>
          </select>
        </label>
        <label class="filter-group">Subject <input class="form-input" [(ngModel)]="newEntry.subject" /></label>
        <label class="filter-group">Teacher <input class="form-input" [(ngModel)]="newEntry.teacher" /></label>
        <label class="filter-group">Day <input class="form-input" [(ngModel)]="newEntry.day" placeholder="Mon/Tue" /></label>
        <label class="filter-group">Time <input class="form-input" [(ngModel)]="newEntry.time" placeholder="HH:MM" /></label>
        <div class="filter-actions"><button class="btn btn-primary" (click)="addEntry()">Add</button></div>
      </div>

      <div class="timetable-grid">
        <div *ngFor="let t of timetable" class="timetable-card">
          <h4>{{t.classId}} • {{t.subject}}</h4>
          <div class="timetable-row"><div>{{t.day}}</div><div>{{t.time}}</div></div>
          <div style="margin-top:0.5rem;display:flex;gap:0.5rem;justify-content:flex-end">
            <button class="btn btn-secondary" (click)="deleteEntry(t.id)">Delete</button>
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
