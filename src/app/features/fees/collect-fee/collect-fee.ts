import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeeService } from '../fee.service';

@Component({
  selector: 'app-collect-fee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collect-fee.html',
  styleUrls: ['../fees.scss']
})
export class CollectFeeComponent {
  search = '';
  results: any[] = [];
  selected: any = null;
  payments: any[] = [];
  amountPaid = 0;
  method = 'Cash';

  constructor(private fee: FeeService) {}

  searchStudent() {
    // simple mock: match by firstName
    this.results = this.fee.getStudents().filter((s: any) => (s.firstName || '').toLowerCase().includes(this.search.toLowerCase()));
  }

  openCollect(s: any) {
    this.selected = s;
    // create mock payment lines from outstanding
    const f = this.fee.getFees().find((x: any) => x.studentId === s.id) || { balance: 0 };
    this.payments = [{ head: 'Outstanding', amount: f.balance || 0, fine: 0 }];
    this.amountPaid = this.payments.reduce((m, p) => m + (p.amount || 0), 0);
  }

  studentOutstanding(studentId: number) {
    const f = this.fee.getFees().find((x: any) => x.studentId === studentId);
    return (f && Number(f.balance)) || 0;
  }

  collect() {
    if (!this.selected) return alert('Select a student');
    const resp = this.fee.collectFee(this.selected.id, this.payments.map(p => ({ head: p.head, amount: Number(p.amount) })), this.method);
    alert('Collected: ' + JSON.stringify(resp));
    this.selected = null; this.results = []; this.search = '';
  }
}
