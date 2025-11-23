import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Fee Management</h2>
      <p>Student fee balances (mock)</p>
      <table class="table">
        <thead><tr><th>Student</th><th>Balance</th><th>Last Paid</th></tr></thead>
        <tbody>
          <tr *ngFor="let f of fees">
            <td>{{studentName(f.studentId)}}</td>
            <td>{{f.balance | currency}}</td>
            <td>{{f.lastPaid}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class FeesComponent {
  fees: any[] = [];
  constructor(private mock: MockDataService) { this.fees = mock.getFees(); }
  studentName(id: number) { const s = this.mock.getStudents().find(x => x.id === id); return s ? s.firstName + ' ' + s.lastName : id; }
}
