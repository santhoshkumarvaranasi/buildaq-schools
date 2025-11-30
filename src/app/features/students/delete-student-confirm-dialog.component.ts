import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../core/material.module';

@Component({
  selector: 'delete-student-confirm-dialog',
  standalone: true,
  imports: [MaterialModule],
  template: `
    <h2 mat-dialog-title>Delete Student</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete <b>{{ data.name }}</b>?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close(false)">Cancel</button>
      <button mat-flat-button color="warn" (click)="close(true)">Delete</button>
    </mat-dialog-actions>
  `
})
export class DeleteStudentConfirmDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { name: string },
    private dialogRef: MatDialogRef<DeleteStudentConfirmDialog>
  ) {}

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}