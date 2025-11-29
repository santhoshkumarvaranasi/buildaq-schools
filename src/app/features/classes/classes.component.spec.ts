import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassesComponent } from './classes';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceComponent } from '../attendance/attendance.component';

describe('ClassesComponent', () => {
  let component: ClassesComponent;
  let fixture: ComponentFixture<ClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassesComponent, AttendanceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close attendance modal', () => {
    const mockClass = { id: 1, name: 'Test Class' } as any;
    component.showAttendance(mockClass);
    expect(component.selectedAttendanceClass).toEqual(mockClass);
    component.closeAttendance();
    expect(component.selectedAttendanceClass).toBeNull();
  });
});
