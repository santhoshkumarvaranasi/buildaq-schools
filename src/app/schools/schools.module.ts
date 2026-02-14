import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Import standalone components
import { SchoolsDashboardComponent } from '../schools-dashboard/schools-dashboard';
import { StudentsComponent } from '../features/students/students';
import { TeachersComponent } from '../features/teachers/teachers';
import { ClassesComponent } from '../features/classes/classes';
import { AttendanceComponent } from '../features/attendance/attendance.component';
import { FeesComponent } from '../features/fees/fees';
import { FeeCategoriesComponent } from '../features/fees/fee-categories/fee-categories';
import { FeeStructureComponent } from '../features/fees/fee-structure/fee-structure';
import { CollectFeeComponent } from '../features/fees/collect-fee/collect-fee';
import { FeeHistoryComponent } from '../features/fees/fee-history/fee-history';
import { MyFeesComponent } from '../features/fees/my-fees/my-fees';
import { FeeDiscountsComponent } from '../features/fees/discounts/discounts';
import { FeeReceiptsComponent } from '../features/fees/receipts/receipts';
import { FeeRemindersComponent } from '../features/fees/reminders/reminders';
import { TimetableComponent } from '../features/timetable/timetable';
import { ExamsComponent } from '../features/exams/exams';
import { AdmissionsComponent } from '../features/admissions/admissions';
import { BehaviorComponent } from '../features/behavior/behavior';
import { AnnouncementsComponent } from '../features/announcements/announcements';
import { LibraryComponent } from '../features/library/library';
import { TransportComponent } from '../features/transport/transport';
import { ClubsComponent } from '../features/clubs/clubs';
import { ParentsComponent } from '../features/parents/parents';
import { HealthComponent } from '../features/health/health';
import { AssetsComponent } from '../features/assets/assets';
import { EventsComponent } from '../features/events/events';
import { ResourcesComponent } from '../features/resources/resources';
import { PerformanceComponent } from '../features/performance/performance';
import { AnalyticsComponent } from '../features/analytics/analytics';
import { StaffingComponent } from '../features/staffing/staffing';
import { NotificationsComponent } from '../features/notifications/notifications';

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
    { path: 'discounts', component: FeeDiscountsComponent },
    { path: 'receipts', component: FeeReceiptsComponent },
    { path: 'reminders', component: FeeRemindersComponent },
    { path: 'my-fees', component: MyFeesComponent }
  ] },
  { path: 'admissions', component: AdmissionsComponent },
  { path: 'announcements', component: AnnouncementsComponent },
  { path: 'behavior', component: BehaviorComponent },
  { path: 'library', component: LibraryComponent },
  { path: 'transport', component: TransportComponent },
  { path: 'clubs', component: ClubsComponent },
  { path: 'parents', component: ParentsComponent },
  { path: 'health', component: HealthComponent },
  { path: 'assets', component: AssetsComponent },
  { path: 'events', component: EventsComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'performance', component: PerformanceComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'staffing', component: StaffingComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'timetable', component: TimetableComponent },
  { path: 'exams', component: ExamsComponent }
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
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
    FeeDiscountsComponent,
    FeeReceiptsComponent,
    FeeRemindersComponent,
    AdmissionsComponent,
    AnnouncementsComponent,
    BehaviorComponent,
    LibraryComponent,
    TransportComponent,
    ClubsComponent,
    ParentsComponent,
    HealthComponent,
    AssetsComponent,
    EventsComponent,
    ResourcesComponent,
    PerformanceComponent,
    AnalyticsComponent,
    StaffingComponent,
    NotificationsComponent,
    TimetableComponent,
    ExamsComponent
  ],
  providers: []
})
export class SchoolsModule { }
