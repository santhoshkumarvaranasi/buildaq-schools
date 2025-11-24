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
import { FeeCategoriesComponent } from '../features/fees/fee-categories/fee-categories';
import { FeeStructureComponent } from '../features/fees/fee-structure/fee-structure';
import { CollectFeeComponent } from '../features/fees/collect-fee/collect-fee';
import { FeeHistoryComponent } from '../features/fees/fee-history/fee-history';
import { MyFeesComponent } from '../features/fees/my-fees/my-fees';
import { TimetableComponent } from '../features/timetable/timetable';
import { ExamsComponent } from '../features/exams/exams';
import { AdmissionsComponent } from '../features/admissions/admissions';

// Define routes for the schools module
const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: SchoolsDashboardComponent },
  { path: 'students', component: StudentsComponent },
  { path: 'teachers', component: TeachersComponent },
  { path: 'classes', component: ClassesComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'fees', component: FeesComponent, children: [
    { path: '', component: CollectFeeComponent },
    { path: 'collect', component: CollectFeeComponent },
    { path: 'categories', component: FeeCategoriesComponent },
    { path: 'structure', component: FeeStructureComponent },
    { path: 'history', component: FeeHistoryComponent },
    { path: 'my-fees', component: MyFeesComponent }
  ] },
  { path: 'admissions', component: AdmissionsComponent },
  { path: 'timetable', component: TimetableComponent },
  { path: 'exams', component: ExamsComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    // Import standalone components
    SchoolsDashboardComponent,
    StudentsComponent,
    TeachersComponent,
    ClassesComponent,
    AttendanceComponent,
    FeesComponent,
    FeeCategoriesComponent,
    FeeStructureComponent,
    CollectFeeComponent,
    FeeHistoryComponent,
    MyFeesComponent,
    AdmissionsComponent,
    TimetableComponent,
    ExamsComponent
  ],
  providers: [
    provideHttpClient()
  ]
})
export class SchoolsModule { }
