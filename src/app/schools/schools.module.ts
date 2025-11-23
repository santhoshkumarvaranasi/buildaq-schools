import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

// Import standalone components
import { SchoolsDashboardComponent } from '../schools-dashboard/schools-dashboard';
import { StudentsComponent } from './students/students';
import { TeachersComponent } from './teachers/teachers';
import { ClassesComponent } from './classes/classes';
import { AttendanceComponent } from '../features/attendance/attendance';
import { FeesComponent } from '../features/fees/fees';
import { TimetableComponent } from '../features/timetable/timetable';
import { ExamsComponent } from '../features/exams/exams';

// Define routes for the schools module
const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: SchoolsDashboardComponent },
  { path: 'students', component: StudentsComponent },
  { path: 'teachers', component: TeachersComponent },
  { path: 'classes', component: ClassesComponent }
  ,{ path: 'attendance', component: AttendanceComponent }
  ,{ path: 'fees', component: FeesComponent }
  ,{ path: 'timetable', component: TimetableComponent }
  ,{ path: 'exams', component: ExamsComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    // Import standalone components
    SchoolsDashboardComponent,
    StudentsComponent,
    TeachersComponent,
    ClassesComponent
    ,AttendanceComponent
    ,FeesComponent
    ,TimetableComponent
    ,ExamsComponent
  ],
  providers: [
    provideHttpClient()
  ]
})
export class SchoolsModule { }