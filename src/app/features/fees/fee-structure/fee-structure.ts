import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../core/material.module';
import { FeeService } from '../fee.service';

@Component({
  selector: 'app-fee-structure',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './fee-structure.html',
  styleUrls: ['../fees.scss']
})
export class FeeStructureComponent {
  classId = '1A';
  structure: any[] = [];
  displayedColumns = ['head', 'amount', 'frequency', 'optional', 'actions'];

  constructor(private fee: FeeService) {
    this.structure = this.fee.getClassFeeStructure(this.classId);
  }

  addHead() {
    this.structure.unshift({ head: 'New Head', amount: 0, frequency: 'Monthly', optional: false });
  }

  removeHead(idx: number) { this.structure.splice(idx, 1); }
}
