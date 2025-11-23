import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Exams & Results</h2>
      <p>Exam creation and marks entry (mock UI placeholder)</p>
      <ul>
        <li>Create Exam</li>
        <li>Bulk marks entry</li>
        <li>Generate report cards</li>
      </ul>
    </div>
  `
})
export class ExamsComponent {}
