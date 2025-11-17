import { Routes } from '@angular/router';
import { SchoolsDashboardComponent } from './schools-dashboard/schools-dashboard';
import { StudentsComponent } from './schools/students/students';
import { TeachersComponent } from './schools/teachers/teachers';
import { ClassesComponent } from './schools/classes/classes';

export const routes: Routes = [
  { path: '', component: SchoolsDashboardComponent },
  { path: 'dashboard', component: SchoolsDashboardComponent },
  { path: 'students', component: StudentsComponent },
  { path: 'teachers', component: TeachersComponent },
  { path: 'classes', component: ClassesComponent },
  { path: '**', redirectTo: '' }
];
