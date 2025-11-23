import { Routes } from '@angular/router';
import { SchoolsDashboardComponent } from './schools-dashboard/schools-dashboard';
import { StudentsComponent } from './schools/students/students';
import { TeachersComponent } from './schools/teachers/teachers';
import { ClassesComponent } from './schools/classes/classes';
import { AttendanceComponent } from './features/attendance/attendance';
import { FeesComponent } from './features/fees/fees';
import { TimetableComponent } from './features/timetable/timetable';
import { ExamsComponent } from './features/exams/exams';

export const routes: Routes = [
  { path: '', component: SchoolsDashboardComponent },
  { path: 'dashboard', component: SchoolsDashboardComponent },
  { path: 'students', component: StudentsComponent },
  { path: 'teachers', component: TeachersComponent },
  { path: 'classes', component: ClassesComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'fees', component: FeesComponent },
  { path: 'timetable', component: TimetableComponent },
  { path: 'exams', component: ExamsComponent },
  { path: '**', redirectTo: '' }
];
