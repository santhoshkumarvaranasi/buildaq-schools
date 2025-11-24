import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeeService } from '../fee.service';
import { MaterialModule } from '../../../core/material.module';

@Component({
  selector: 'app-my-fees',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './my-fees.html',
  styleUrls: ['../fees.scss']
})
export class MyFeesComponent {
  studentId = 1;
  data: any = { outstanding: null, history: [] };
  constructor(private fee: FeeService) {
    this.data = this.fee.getStudentFees(this.studentId);
  }
}
