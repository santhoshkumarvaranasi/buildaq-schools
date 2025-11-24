import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ['./fees.scss'],
  template: `
    <div class="page">
      <h2>Fee Management</h2>
      <nav style="display:flex;gap:0.5rem;margin-bottom:0.75rem;">
        <a routerLink="/schools/fees/collect" class="btn btn-primary">Collect</a>
        <a routerLink="/schools/fees/categories" class="btn">Categories</a>
        <a routerLink="/schools/fees/structure" class="btn">Structure</a>
        <a routerLink="/schools/fees/history" class="btn">History</a>
        <a routerLink="/schools/fees/my-fees" class="btn">My Fees</a>
      </nav>

      <p>Student fee balances (mock)</p>

      <div class="fees-controls">
        <label>Search student: <input class="form-input" [(ngModel)]="search" placeholder="name or id" /></label>
      </div>

      <div class="fee-summary">Total Outstanding: {{ totalOutstanding() | currency }}</div>

      <table class="students-table">
        <thead><tr><th>Student</th><th>Balance</th><th>Last Paid</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let f of filteredFees()">
            <td>{{studentName(f.studentId)}}</td>
            <td>{{f.balance | currency}}</td>
            <td>{{f.lastPaid}}</td>
            <td>
              <input type="number" class="form-input" [(ngModel)]="paymentAmounts[f.studentId]" placeholder="amount" style="width:90px" />
              <button class="btn btn-primary" (click)="pay(f.studentId)">Pay</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top:1rem">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class FeesComponent {
  fees: any[] = [];
  search = '';
  paymentAmounts: Record<number, number> = {};
  students: any[] = [];

  constructor(private mock: MockDataService) {
    this.fees = mock.getFees();
  }

  ngOnInit() {
    this.students = this.mock.getStudents();
    // prefill paymentAmounts
    this.fees.forEach(f => this.paymentAmounts[f.studentId] = 0);
  }

  studentName(id: number) { const s = this.students.find(x => x.id === id); return s ? s.firstName + ' ' + s.lastName : id; }

  filteredFees() {
    if (!this.search) return this.fees;
    const s = this.search.toLowerCase();
    return this.fees.filter(f => {
      const st = this.students.find(x => x.id === f.studentId);
      return String(f.studentId).includes(s) || (st && (st.firstName + ' ' + st.lastName).toLowerCase().includes(s));
    });
  }

  pay(studentId: number) {
    const amount = Number(this.paymentAmounts[studentId]) || 0;
    if (amount <= 0) return;
    const today = new Date().toISOString().slice(0,10);
    this.mock.payFee(studentId, amount, today);
    this.fees = this.mock.getFees();
    this.paymentAmounts[studentId] = 0;
  }

  totalOutstanding(): number {
    return this.fees.reduce((sum, f) => sum + (Number(f.balance) || 0), 0);
  }
}
