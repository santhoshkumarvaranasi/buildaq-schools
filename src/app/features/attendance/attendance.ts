import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Attendance</h2>
      <p>Quick attendance snapshot (mock data)</p>
      <table class="table">
        <thead><tr><th>ID</th><th>Student</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          <tr *ngFor="let a of attendance">
            <td>{{a.id}}</td>
            <td>{{studentName(a.studentId)}}</td>
            <td>{{a.date}}</td>
            <td>{{a.status}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AttendanceComponent {
  attendance: any[] = [];
  constructor(private mock: MockDataService) { this.attendance = mock.getAttendance(); }
  studentName(id: number) { const s = this.mock.getStudents().find(x => x.id === id); return s ? s.firstName + ' ' + s.lastName : id; }
}
