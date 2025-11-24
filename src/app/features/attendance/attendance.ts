import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { MaterialModule } from '../../core/material.module';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./attendance.scss'],
  template: `
    <div class="students-container">
      <div class="students-header">
        <h2>Attendance</h2>
        <p class="students-count"><small>Quick attendance snapshot (mock data)</small></p>
      </div>

      <div class="filters-section attendance-form">
        <mat-form-field appearance="outline" class="filter-group">
          <mat-label>Student</mat-label>
          <mat-select [(ngModel)]="newStudentId">
            <mat-option *ngFor="let s of students" [value]="s.id">{{s.firstName}} {{s.lastName}}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-group">
          <mat-label>Date</mat-label>
          <input matInput type="date" [(ngModel)]="newDate" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-group">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="newStatus">
            <mat-option value="present">Present</mat-option>
            <mat-option value="absent">Absent</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="filter-actions"><button mat-raised-button color="primary" (click)="addAttendance()">Mark</button></div>
      </div>

      <div class="students-table-container">
        <div class="table-scroll-container">
          <table class="students-table">
            <thead><tr><th>ID</th><th>Student</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let a of attendance">
                <td>{{a.id}}</td>
                <td>{{studentName(a.studentId)}}</td>
                <td>{{a.date}}</td>
                <td><span class="status-badge" [ngClass]="{'status-present': a.status==='present','status-absent': a.status==='absent'}">{{a.status}}</span></td>
                <td>
                  <button mat-stroked-button (click)="toggleStatus(a)">Toggle</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AttendanceComponent {
  attendance: any[] = [];
  students: any[] = [];
  newStudentId: number | null = null;
  newDate: string = new Date().toISOString().slice(0,10);
  newStatus = 'present';
  constructor(private mock: MockDataService) { this.attendance = mock.getAttendance(); }
  ngOnInit() { this.students = this.mock.getStudents(); if (this.students.length) this.newStudentId = this.students[0].id; }
  studentName(id: number) { const s = this.mock.getStudents().find(x => x.id === id); return s ? s.firstName + ' ' + s.lastName : id; }

  addAttendance() {
    if (!this.newStudentId) return;
    const created = this.mock.addAttendance(this.newStudentId, this.newDate, this.newStatus);
    this.attendance = this.mock.getAttendance();
  }

  toggleStatus(a: any) {
    const next = a.status === 'present' ? 'absent' : 'present';
    this.mock.updateAttendanceStatus(a.id, next);
    this.attendance = this.mock.getAttendance();
  }
}
