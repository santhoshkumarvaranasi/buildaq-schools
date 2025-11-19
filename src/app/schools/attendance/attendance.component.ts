import { Component, Input, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from './attendance.service';
import { AttendanceRecord } from './attendance.model';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="attendance-container">
      <h2>Attendance for {{ className }} ({{ date }})</h2>
      <table class="attendance-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let record of records">
            <td>{{ record.studentName }}</td>
            <td>
              <select [(ngModel)]="record.status" (change)="updateStatus(record)">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            </td>
            <td>
              <input [(ngModel)]="record.notes" (blur)="updateStatus(record)" placeholder="Notes..." />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .attendance-container { padding: 1rem; }
    .attendance-table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #e4e9f0; padding: 0.5rem; }
    th { background: #f8f9fa; }
    select, input { width: 100%; }
  `]
})
export class AttendanceComponent implements OnInit {
  @Input() classId!: number;
  @Input() className!: string;
  @Input() date!: string;
  records: AttendanceRecord[] = [];

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit() {
    this.records = this.attendanceService.getRecordsForClass(this.classId, this.date);
  }

  updateStatus(record: AttendanceRecord) {
    this.attendanceService.updateRecord(record.id, {
      status: record.status,
      notes: record.notes
    });
  }
}
