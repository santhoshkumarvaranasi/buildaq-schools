import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AttendanceService } from '../attendance/attendance.service';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AttendanceComponent } from '../attendance/attendance.component';
import { ApiService } from '../../core/services/api.service';

export interface Class {
  id: number;
  name: string;
  code?: string;
  department?: string;
  teacherName?: string;
  maxStudents?: number;
  enrolledStudents?: number;
  semester?: string;
  status?: string;
  year?: number;
  credits?: number;
  schedule?: Array<{ day: string; startTime?: string; endTime?: string; room?: string }>;
  prerequisites?: string[];
}

export interface Enrollment {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  status: string;
}

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, AttendanceComponent],
  templateUrl: './classes.html',
  styleUrls: ['./classes.scss']
})
export class ClassesComponent implements OnInit, AfterViewInit {
  classes: Class[] = [];
  enrollments: Enrollment[] = [];

  filteredClasses: Class[] = [];
  selectedClass: Class | null = null;
  showEnrollmentModal = false;
  searchTerm = '';
  selectedDepartment = '';
  selectedSemester = '';
  selectedStatus = '';
  viewMode: 'table' | 'cards' = 'table';
  displayLimit = 20;
  // Template-driven properties required by classes.html
  sortField: string = 'name';
  currentSort: { field: string; direction: 'asc' | 'desc' } = { field: 'name', direction: 'asc' };
  newEnrollmentStudentId: number | null = null;
  allStudents: { studentId: number; studentName: string }[] = [];
  selectedEnrollmentClass: Class | null = null;
  selectedAttendanceClass: Class | null = null;
  attendanceDate: string = new Date().toISOString();
  showScrollIndicator = false;
  // Additional template members
  showMobileFilters = false;
  departments: string[] = [];
  semesters: string[] = [];

  constructor(private attendanceService: AttendanceService, private http: HttpClient, private api: ApiService, private cdr: ChangeDetectorRef, private zone: NgZone) {
    try { console.log('ClassesComponent constructor'); } catch (e) {}
  }

  ngAfterViewInit(): void {
    try { console.log('ClassesComponent ngAfterViewInit'); } catch (e) {}
  }

  ngOnInit(): void {
    this.fetchClasses();
    this.fetchEnrollments();
  }

  fetchClasses(): void {
    try { console.log('Fetching classes via ApiService'); } catch (e) {}
      this.api.get<any>('classes/summary').subscribe({
        next: resp => {
          // Normalize multiple response shapes: raw array, ApiResponse { data: [] }, or legacy { classes: [] }
          let data: any[] = [];
          if (Array.isArray(resp)) {
            data = resp;
          } else if (resp && Array.isArray(resp.data)) {
            data = resp.data;
          } else if (resp && Array.isArray(resp.classes)) {
            data = resp.classes;
          } else {
            console.warn('Unexpected /classes response — expected array, got:', resp);
          }
          this.classes = Array.isArray(data) ? (data as Class[]) : [];
        // Update arrays inside Angular zone to ensure change detection fires
        try {
          this.zone.run(() => {
            this.departments = Array.from(new Set(this.classes.map(x => x.department).filter(Boolean) as string[])).sort();
            this.semesters = Array.from(new Set(this.classes.map(x => x.semester).filter(Boolean) as string[])).sort();
            this.applyFilters();
          });
        } catch (e) {
          this.departments = Array.from(new Set(this.classes.map(x => x.department).filter(Boolean) as string[])).sort();
          this.semesters = Array.from(new Set(this.classes.map(x => x.semester).filter(Boolean) as string[])).sort();
          this.applyFilters();
        }
        // Debug log to inspect values during dev
        try {
          // eslint-disable-next-line no-console
          console.log('Classes fetched:', { count: this.classes.length, departments: this.departments.slice(0,50), semesters: this.semesters.slice(0,50), filtered: this.filteredClasses.length });
        } catch (e) {}
        // Ensure template updates reliably (run detectChanges in next macrotask)
        try { setTimeout(() => { try { this.cdr.detectChanges(); } catch (e) {} }, 0); } catch (e) { try { this.cdr.detectChanges(); } catch (e) {} }
        // If departments list is unexpectedly small, try fetching departments directly from API
        try {
          if (!this.departments || this.departments.length <= 1) {
            try { console.log('Departments list small, fetching via ApiService'); } catch (e) {}
            this.api.get<string[]>('departments').subscribe({
              next: dresp => {
                const ddata = dresp?.data;
                if (Array.isArray(ddata) && ddata.length) {
                  this.departments = Array.from(new Set(ddata.filter(Boolean))).sort();
                  try { setTimeout(() => { try { this.cdr.detectChanges(); } catch (e) {} }, 0); } catch (e) { try { this.cdr.detectChanges(); } catch (e) {} }
                }
              },
              error: err => { /* best-effort */ }
            });
          }
        } catch (e) {}
      },
      error: err => console.error('Error fetching classes', err)
    });
  }

  fetchEnrollments(): void {
    this.api.get<Enrollment[]>('enrollments/summary').subscribe({
      next: data => {
        if (!Array.isArray(data)) {
          console.warn('Unexpected /enrollments response — expected array, got:', data);
          const maybe = (data as any) || {};
          this.enrollments = Array.isArray(maybe.enrollments) ? maybe.enrollments as Enrollment[] : [];
        } else {
          this.enrollments = data as Enrollment[];
        }
        try {
          // eslint-disable-next-line no-console
          console.log('Enrollments fetched:', { count: this.enrollments.length });
          this.zone.run(() => {
            // ensure change detection
          });
        } catch (e) {}
        try { setTimeout(() => { try { this.cdr.detectChanges(); } catch (e) {} }, 0); } catch (e) { try { this.cdr.detectChanges(); } catch (e) {} }
      },
      error: err => console.error('Error fetching enrollments', err)
    });
  }

  applyFilters(): void {
    let out = [...this.classes];
    const term = this.searchTerm?.trim().toLowerCase();
    if (term) {
      out = out.filter(c => (c.name || '').toLowerCase().includes(term) || (c.code || '').toLowerCase().includes(term));
    }
    if (this.selectedDepartment) out = out.filter(c => c.department === this.selectedDepartment);
    if (this.selectedSemester) out = out.filter(c => c.semester === this.selectedSemester);
    if (this.selectedStatus) out = out.filter(c => c.status === this.selectedStatus);
    // Apply simple sort
    const f = this.currentSort.field || this.sortField;
    const dir = this.currentSort.direction === 'desc' ? -1 : 1;
    out.sort((a: any, b: any) => {
      const va = (a && a[f]) || '';
      const vb = (b && b[f]) || '';
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    this.filteredClasses = out;
  }

  /* Newly added template helper methods */
  exportClassList(): void {
    const rows = [ ['ID','Code','Name','Department','Semester','Year','Credits','Status'] ];
    this.classes.forEach(c => rows.push([String(c.id), c.code||'', c.name||'', c.department||'', c.semester||'', String(c.year||''), String(c.credits||''), c.status||'']));
    const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'classes.csv'; a.click(); URL.revokeObjectURL(url);
  }

  toggleMobileFilters(): void { this.showMobileFilters = !this.showMobileFilters; }
  filterClasses(): void { this.applyFilters(); }
  sortClasses(): void { this.sortByField(this.sortField); }
  getActiveCount(): number { return this.classes.filter(c => c.status === 'active').length; }
  getTotalEnrollments(): number { return this.enrollments.filter(e => e.status === 'enrolled').length; }
  getAverageCapacity(): number { if (!this.classes.length) return 0; const vals = this.classes.map(c => this.getCapacityPercentage(c)); const avg = Math.round(vals.reduce((s,n) => s + n, 0)/vals.length); return avg; }
  getDepartmentCount(): number { return this.departments.length; }
  getEnrollmentStatus(c: Class): string { if (!c.maxStudents) return 'unknown'; const perc = this.getCapacityPercentage(c); if (perc >= 100) return 'full'; if (perc >= 90) return 'nearly-full'; return 'open'; }
  formatPrerequisites(pr: string[] | undefined): string { if (!pr || pr.length===0) return 'None'; return pr.join(', '); }
  viewSchedule(_: Class): void { /* stub - could open schedule modal */ }
  duplicateClass(src: Class): void { const copy: Class = { ...src, id: Date.now() }; this.classes.push(copy); this.applyFilters(); }

  openEnrollmentModal(c: Class): void { this.selectedClass = c; this.showEnrollmentModal = true; }
  closeEnrollmentModal(): void { this.selectedClass = null; this.showEnrollmentModal = false; }
  getEnrolledForClass(classId: number): Enrollment[] { return this.enrollments.filter(e => e.classId === classId && e.status === 'enrolled'); }

  ensureAttendanceRecordsForClass(classId: number): void {
    const enrolled = this.getEnrolledForClass(classId);
    const date = new Date();
    const dateStr = date.toISOString();
    enrolled.forEach(s => {
      const existing = this.attendanceService.getRecordsForClass(classId, dateStr).find((r: any) => r.studentId === s.studentId);
      if (!existing) {
        this.attendanceService.addRecord({
          id: Date.now(),
          studentId: s.studentId,
          studentName: s.studentName,
          classId,
          className: this.classes.find(c => c.id === classId)?.name || '',
          date: dateStr,
          status: 'present',
          notes: ''
        } as any);
      }
    });
  }

  onSearch(term?: string): void { if (term !== undefined) this.searchTerm = term; this.applyFilters(); }
  clearSearch(): void { this.searchTerm = ''; this.applyFilters(); }

  checkScrollIndicator(): void { /* noop */ }

  /* Template helper implementations (lightweight stubs) */
  setViewMode(mode: 'table' | 'cards') { this.viewMode = mode; }
  sortByField(field: string) { if (this.currentSort.field === field) { this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc'; } else { this.currentSort.field = field; this.currentSort.direction = 'asc'; } this.applyFilters(); }
  trackByClassId(_: number, item: Class) { return item.id; }
  isClassSelected(item: Class) { return !!this.selectedClass && this.selectedClass.id === item.id; }
  selectClass(item: Class) { this.selectedClass = item; }
  getCapacityPercentage(item: Class) { if (!item.maxStudents) return 0; return Math.round(((item.enrolledStudents || 0) / item.maxStudents) * 100); }
  getCapacityClass(item: Class) { const p = this.getCapacityPercentage(item); if (p >= 90) return 'capacity-high'; if (p >= 60) return 'capacity-medium'; return 'capacity-low'; }
  getStatusClass(status?: string) { switch (status) { case 'active': return 'status-active'; case 'cancelled': return 'status-cancelled'; case 'completed': return 'status-completed'; default: return ''; } }
  getStatusIcon(status?: string) { switch (status) { case 'active': return '✅'; case 'cancelled': return '❌'; case 'completed': return '🏁'; default: return ''; } }

  // Enrollment UI methods
  showAttendance(item: Class) { this.selectedAttendanceClass = item; this.ensureAttendanceRecordsForClass(item.id); }
  closeAttendance() { this.selectedAttendanceClass = null; }
  viewClass(_: Class) { /* stub - navigate to details */ }
  editClass(_: Class) { /* stub - open editor */ }
  manageEnrollment(item: Class) { this.selectedEnrollmentClass = item; this.showEnrollmentModal = true; }
  getEnrolledStudents(classId: number) { return this.enrollments.filter(e => e.classId === classId && e.status === 'enrolled'); }
  removeStudentFromClass(enrollmentId: number) { const idx = this.enrollments.findIndex(e => e.id === enrollmentId); if (idx > -1) this.enrollments[idx].status = 'dropped'; }
  addStudentToClass() { if (!this.selectedEnrollmentClass || !this.newEnrollmentStudentId) return; const s = this.allStudents.find(x => x.studentId === this.newEnrollmentStudentId); if (!s) return; this.enrollments.push({ id: Date.now(), studentId: s.studentId, studentName: s.studentName, classId: this.selectedEnrollmentClass.id, status: 'enrolled' }); this.newEnrollmentStudentId = null; }
  generateReport(_: Class) { /* stub */ }
  loadMoreClasses() { this.displayLimit += 20; }
  clearFilters() { this.selectedDepartment = ''; this.selectedSemester = ''; this.selectedStatus = ''; this.searchTerm = ''; this.applyFilters(); }
  addClass() { /* stub */ }
}
