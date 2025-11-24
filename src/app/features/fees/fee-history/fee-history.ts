import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeeService } from '../fee.service';

@Component({
  selector: 'app-fee-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fee-history.html',
  styleUrls: ['../fees.scss']
})
export class FeeHistoryComponent {
  studentId = 1;
  data: any = { outstanding: null, history: [] };
  constructor(private fee: FeeService) {
    this.data = this.fee.getStudentFees(this.studentId);
  }
}
