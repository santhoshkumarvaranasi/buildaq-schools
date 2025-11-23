import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Timetable</h2>
      <p>Simple timetable view (mock)</p>
      <div *ngFor="let c of classes" class="class-card">
        <h3>{{c.name}} <small>({{c.teacher}})</small></h3>
        <p>Capacity: {{c.capacity}}</p>
      </div>
    </div>
  `
})
export class TimetableComponent {
  classes: any[] = [];
  constructor(private mock: MockDataService) { this.classes = mock.getClasses(); }
}
