import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../core/material.module';

export interface StudentDialogData {
  classes: string[];
  student?: any;
  mode?: 'add' | 'edit';
}

@Component({
  selector: 'app-add-student-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'edit' ? 'Edit Student' : 'Add Student' }}</h2>
    <mat-dialog-content class="dialog-body">
      <div class="form-grid">
        <mat-form-field appearance="fill">
          <mat-label>Full name</mat-label>
          <input matInput [(ngModel)]="form.name" placeholder="Jane Doe" />
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Class</mat-label>
          <mat-select [(ngModel)]="form.class">
            <mat-option *ngFor="let c of data.classes" [value]="c">{{ c }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Section</mat-label>
          <input matInput [(ngModel)]="form.section" />
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Roll No</mat-label>
          <input matInput [(ngModel)]="form.rollNo" />
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Email</mat-label>
          <input matInput type="email" [(ngModel)]="form.email" />
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="form.status">
            <mat-option value="active">Active</mat-option>
            <mat-option value="inactive">Inactive</mat-option>
            <mat-option value="transferred">Transferred</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Enrollment date</mat-label>
          <input matInput type="date" [(ngModel)]="form.enrollmentDate" />
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="!form.name?.trim()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-body { padding-top: 4px; }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
      gap: 12px;
      padding-top: 6px;
    }
  `]
})
export class AddStudentDialogComponent {
  form: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: StudentDialogData,
    private dialogRef: MatDialogRef<AddStudentDialogComponent>
  ) {
    this.form = Object.assign({
      class: '',
      section: '',
      rollNo: '',
      email: '',
      status: 'active',
      enrollmentDate: new Date().toISOString().slice(0, 10)
    }, data.student || {});
    if (data.student) {
      this.form.name = `${data.student.firstName || ''} ${data.student.lastName || ''}`.trim() || this.form.name;
    } else {
      this.form.name = this.form.name || '';
    }
  }

  save() {
    if (!this.form.name?.trim()) return;
    this.dialogRef.close(this.form);
  }

  close() {
    this.dialogRef.close();
  }
}
