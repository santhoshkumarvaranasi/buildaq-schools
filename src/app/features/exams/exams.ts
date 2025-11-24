import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { MaterialModule } from '../../core/material.module';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./exams.scss'],
  template: `
    <div class="students-container">
      <div class="students-header">
        <h2>Exams & Results</h2>
      </div>

      <div class="filters-section exam-form">
        <label class="filter-group">Title
          <input class="form-input" [(ngModel)]="newTitle" />
        </label>
        <label class="filter-group">Date
          <input class="form-input" type="date" [(ngModel)]="newDate" />
        </label>
        <label class="filter-group">Assign Students
          <select class="form-select" multiple size="4" [(ngModel)]="selectedStudentIds">
            <option *ngFor="let s of students" [value]="s.id">{{s.firstName}} {{s.lastName}}</option>
          </select>
        </label>
        <div class="filter-actions">
          <button class="btn btn-primary" (click)="createExam()">Create Exam</button>
        </div>
      </div>

      <div class="mobile-cards">
        <div *ngFor="let e of exams" class="student-card">
          <div class="student-card-header">
            <div class="student-info">
              <p class="student-card-name">{{e.title}}</p>
              <p class="student-card-id">{{e.date}}</p>
            </div>
          </div>
          <div class="student-card-body">
            <div *ngIf="e.studentMarks">
              <table class="students-table">
                <thead><tr><th>Student</th><th>Marks</th></tr></thead>
                <tbody>
                  <tr *ngFor="let sm of e.studentMarks">
                    <td>{{studentName(sm.studentId)}}</td>
                    <td>
                      <input class="form-input" type="number" [(ngModel)]="sm.marks" style="width:80px" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="student-card-actions">
            <button class="card-action-btn primary btn" (click)="saveMarks(e)">Save Marks</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ExamsComponent {
  exams: any[] = [];
  students: any[] = [];
  newTitle = '';
  newDate = new Date().toISOString().slice(0,10);
  selectedStudentIds: number[] = [];

  constructor(private mock: MockDataService) { this.exams = mock.getExams(); this.students = mock.getStudents(); }

  studentName(id: number) { const s = this.students.find(x => x.id === id); return s ? s.firstName + ' ' + s.lastName : id; }

  createExam() {
    if (!this.newTitle) return;
    this.mock.createExam(this.newTitle, this.newDate, this.selectedStudentIds);
    this.exams = this.mock.getExams();
    this.newTitle = '';
    this.selectedStudentIds = [];
  }

  saveMarks(exam: any) {
    const marks = exam.studentMarks.map((sm: any) => ({ studentId: sm.studentId, marks: Number(sm.marks) }));
    this.mock.recordMarks(exam.id, marks);
    this.exams = this.mock.getExams();
  }
}
