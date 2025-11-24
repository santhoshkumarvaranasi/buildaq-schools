import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { MaterialModule } from '../../core/material.module';

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  styleUrls: ['./fees.scss'],
  template: `
    <div class="page">
      <h2>Fee Management</h2>
      <nav class="fees-nav">
        <button mat-raised-button color="primary" [routerLink]="['/schools/fees/collect']">Collect</button>
        <button mat-stroked-button [routerLink]="['/schools/fees/categories']">Categories</button>
        <button mat-stroked-button [routerLink]="['/schools/fees/structure']">Structure</button>
        <button mat-stroked-button [routerLink]="['/schools/fees/history']">History</button>
        <button mat-stroked-button [routerLink]="['/schools/fees/my-fees']">My Fees</button>
      </nav>

      <p>Student fee balances (mock)</p>

      <div class="fees-controls">
        <label>Search student: <input class="form-input" [(ngModel)]="search" placeholder="name or id" /></label>
      </div>

      <div class="fee-summary">Total Outstanding: {{ totalOutstanding() | currency }}</div>

      <table mat-table [dataSource]="dataSource" class="fees-table mat-elevation-z1">
        <!-- Student Column -->
        <ng-container matColumnDef="student">
          <th mat-header-cell *matHeaderCellDef> Student </th>
          <td mat-cell *matCellDef="let f"> {{ studentName(f.studentId) }} </td>
        </ng-container>

        <!-- Balance Column -->
        <ng-container matColumnDef="balance">
          <th mat-header-cell *matHeaderCellDef> Balance </th>
          <td mat-cell *matCellDef="let f"> {{ f.balance | currency }} </td>
        </ng-container>

        <!-- Last Paid Column -->
        <ng-container matColumnDef="lastPaid">
          <th mat-header-cell *matHeaderCellDef> Last Paid </th>
          <td mat-cell *matCellDef="let f"> {{ f.lastPaid }} </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Actions </th>
          <td mat-cell *matCellDef="let f">
            <mat-form-field appearance="outline" class="compact-number">
              <input matInput type="number" [(ngModel)]="paymentAmounts[f.studentId]" placeholder="amount" />
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="pay(f.studentId)">Pay</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <div class="router-outlet-wrap">
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
  // Material table support
  displayedColumns: string[] = ['student','balance','lastPaid','actions'];

  get dataSource() { return this.filteredFees(); }

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
