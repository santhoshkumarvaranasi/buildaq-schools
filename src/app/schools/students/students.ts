import { ChangeDetectorRef, Component, HostListener, NgZone, OnInit, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolsService } from '../schools.service';
import { TenantService } from '../../core/services/tenant.service';

export interface Student {
  id: number;
  rollNo?: string;
  firstName?: string;
  lastName?: string;
  class?: string;
  fullName?: string;
  grade?: string;
  section?: string;
  status?: string;
  email?: string;
  enrollmentDate?: Date | string;
  dateOfBirth?: Date | string;
  // Structured address parts used by the Add modal
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  // Emergency contact pieces
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  schoolId?: number;
  [key: string]: any;
}

export interface SortConfig {
  field: string;
  dir: 'asc' | 'desc';
}

@Component({
  selector: 'app-students',
  standalone: true,
  templateUrl: './students.html',
  styleUrls: ['./students.scss'],
  // allow template directives and ngModel in this component
  imports: [CommonModule, FormsModule],
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  grades: string[] = [];
  searchTerm = '';
  selectedGrade?: string;
  selectedStatus?: string;
  showMobileFilters = false;
  // support template expectations: 'table' / 'cards' and legacy 'list'/'grid'
  viewMode: 'list' | 'grid' | 'table' | 'cards' = 'table';
  displayLimit = 50;
  isLoading = false;
  sortConfig: SortConfig = { field: 'fullName', dir: 'asc' };

  // template-facing fields
  selectedStudent: Student | null = null;
  showScrollIndicator = false;
  sortField = this.sortConfig.field;
  // Add-student form state
  showAddForm = false;
  isSubmitting = false;
  newStudent: Partial<Student> = {
    firstName: '',
    lastName: '',
    grade: '',
    section: '',
    email: '',
    status: 'active',
    rollNo: '',
    class: '',
    dateOfBirth: '',
    enrollmentDate: '',
    addressLine1: '',
    addressLine2: '',
    addressCity: '',
    addressState: '',
    addressPostalCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  };

  // Progressive disclosure flags for the Add modal
  showAddressSection = false;
  showEmergencySection = false;
  showMoreSection = false;

  toggleAddress() {
    this.showAddressSection = !this.showAddressSection;
  }

  toggleEmergency() {
    this.showEmergencySection = !this.showEmergencySection;
  }

  toggleMore() {
    this.showMoreSection = !this.showMoreSection;
  }

  constructor(
    private schoolsService: SchoolsService,
    private tenantService: TenantService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef
  ) {}

  ngOnInit(): void {
    this.detectViewMode();
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.schoolsService.getStudents().subscribe({
      next: (resp) => {
        const response: any = resp as any;
        let arrRaw: any;
        if (Array.isArray(response)) arrRaw = response;
        else if (response && response.data) arrRaw = response.data;
        else if (response && response.students) arrRaw = response.students;
        else if (response && response.items) arrRaw = response.items;
        else arrRaw = [];

        const arr: Student[] = Array.isArray(arrRaw) ? arrRaw : [];

        const mapped = arr.map((s: any) => {
          // Normalize status to a string so Angular pipes (titlecase) don't receive objects
          let statusVal = 'active';
          if (typeof s.status === 'string' && s.status.trim()) {
            statusVal = s.status;
          } else if (s.status && (s.status.name || s.status.Name)) {
            statusVal = s.status.name || s.status.Name;
          } else if (s.enrollmentStatus) {
            statusVal = s.enrollmentStatus;
          } else if (s.statusId) {
            statusVal = String(s.statusId);
          }

          // Start from a shallow copy of the original to preserve extra fields,
          // then explicitly override the keys we normalize so the normalized
          // `status` (string) is not accidentally overwritten by the original
          // navigation object (which caused the TitleCase pipe error).
          const base = Object.assign({}, s);
          // remove status from base to ensure we replace it with a string
          if (base.hasOwnProperty('status')) delete base.status;

          return Object.assign({}, base, {
            id: s.id ?? s.studentId ?? 0,
            rollNo: s.rollNo ?? s.roll_number ?? s.roll,
            firstName: s.firstName ?? s.first_name ?? s.fname ?? s.first,
            lastName: s.lastName ?? s.last_name ?? s.lname ?? s.last,
            fullName: s.fullName ?? `${s.firstName || s.first || ''} ${s.lastName || s.last || ''}`.trim(),
            // backend exposes grade as a few different shapes (grade, gradeLevel, grade_level)
            grade: s.grade ?? s.gradeLevel ?? s.grade_level ?? s.class ?? s.standard,
            // Classes may be returned as an array of class objects; pick the first class name
            class: (s.classes && s.classes.length) ? (s.classes[0].name ?? s.classes[0].Name ?? '') : (s.class ?? s.className ?? ''),
            section: s.section ?? s.sectionName ?? s.section_id,
            // Use the normalized status string
            status: statusVal,
            email: s.email,
            enrollmentDate: s.enrollmentDate ?? s.enrollmentDateString,
            schoolId: s.schoolId ?? s.school_id,
          }) as Student;
        });

        this.zone.run(() => {
          this.students = mapped;
          this.grades = Array.from(new Set(this.students.map((st) => st.grade).filter(Boolean))) as string[];
          this.applyFiltersAndSort();
          this.isLoading = false;
          setTimeout(() => this.cdr.detectChanges(), 0);
        });
      },
      error: (err) => {
        console.error('Failed to load students', err);
        this.zone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  /* Add student form handlers */
  openAddForm() {
    try { console.debug && console.debug('openAddForm called'); } catch (e) {}
    this.showAddForm = true;
    this.newStudent = { firstName: '', lastName: '', grade: '', section: '', email: '', status: 'active', rollNo: '' };
    try { this.cdr.detectChanges(); } catch (e) {}
  }

  cancelAdd() {
    this.showAddForm = false;
    this.isSubmitting = false;
  }

  submitNewStudent() {
    if (this.isSubmitting) return;
    // basic validation
    if (!this.newStudent.firstName || !this.newStudent.lastName) {
      alert('Please enter first and last name');
      return;
    }
    this.isSubmitting = true;
    // Prepare payload: send structured fields as JSON strings for backend jsonb columns
    const payload: any = { ...this.newStudent };
    // address -> json string
    payload.address = JSON.stringify({
      line1: this.newStudent.addressLine1 ?? null,
      line2: this.newStudent.addressLine2 ?? null,
      city: this.newStudent.addressCity ?? null,
      state: this.newStudent.addressState ?? null,
      postalCode: this.newStudent.addressPostalCode ?? null,
    });
    // emergency contact -> json string
    payload.emergencyContact = JSON.stringify({
      name: this.newStudent.emergencyContactName ?? null,
      phone: this.newStudent.emergencyContactPhone ?? null,
      relation: this.newStudent.emergencyContactRelation ?? null,
    });
    // normalize dates to ISO strings when provided
    if (this.newStudent.dateOfBirth) payload.dateOfBirth = new Date(this.newStudent.dateOfBirth as any).toISOString();
    if (this.newStudent.enrollmentDate) payload.enrollmentDate = new Date(this.newStudent.enrollmentDate as any).toISOString();

    this.schoolsService.createStudent(payload).subscribe({
      next: (created: any) => {
        try {
          // Normalize created shape and add to local list
          const s = {
            id: created.id ?? created.studentId ?? Date.now(),
            rollNo: created.rollNo ?? created.roll_number ?? this.newStudent.rollNo,
            firstName: created.firstName ?? this.newStudent.firstName,
            lastName: created.lastName ?? this.newStudent.lastName,
            fullName: created.fullName ?? `${this.newStudent.firstName || ''} ${this.newStudent.lastName || ''}`.trim(),
            grade: created.grade ?? this.newStudent.grade,
            section: created.section ?? this.newStudent.section,
            status: created.status ?? this.newStudent.status ?? 'active',
            email: created.email ?? this.newStudent.email,
            enrollmentDate: created.enrollmentDate ?? new Date().toISOString(),
            schoolId: created.schoolId ?? null,
            ...created
          } as Student;
          this.students.unshift(s);
          this.applyFiltersAndSort();
          this.showAddForm = false;
        } catch (e) {
          console.error('Error handling created student', e, created);
        }
        this.isSubmitting = false;
        try { this.cdr.detectChanges(); } catch (e) {}
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Failed to create student', err);
        alert('Failed to create student: ' + (err?.message || 'Unknown error'));
      }
    });
  }

  applyFiltersAndSort(): void {
    let list = [...this.students];
    if (this.selectedGrade) list = list.filter((s) => s.grade === this.selectedGrade);
    if (this.selectedStatus) list = list.filter((s) => (s.status || '').toLowerCase() === (this.selectedStatus || '').toLowerCase());
    if (this.searchTerm && this.searchTerm.trim().length > 0) {
      const term = this.searchTerm.trim().toLowerCase();
      list = list.filter((s) => (s.fullName || '').toLowerCase().includes(term) || (s.rollNo || '').toLowerCase().includes(term));
    }

    const field = this.sortConfig.field;
    const dir = this.sortConfig.dir === 'asc' ? 1 : -1;
    list.sort((a: any, b: any) => {
      const va = (a[field] ?? '') as string | number;
      const vb = (b[field] ?? '') as string | number;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });

    this.filteredStudents = list.slice(0, this.displayLimit);
  }

  // Template-friendly APIs -------------------------------------------------
  onSearch(): void {
    this.applyFiltersAndSort();
    this.cdr.detectChanges();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFiltersAndSort();
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.selectedGrade = undefined;
    this.selectedStatus = undefined;
    this.searchTerm = '';
    this.applyFiltersAndSort();
    this.cdr.detectChanges();
  }

  sortByField(field: string): void {
    if (this.sortConfig.field === field) this.sortConfig.dir = this.sortConfig.dir === 'asc' ? 'desc' : 'asc';
    else this.sortConfig = { field, dir: 'asc' };
    this.applyFiltersAndSort();
  }

  sortStudents(): void {
    this.applyFiltersAndSort();
  }

  // Compatibility alias used by templates
  filterStudents(): void {
    this.applyFiltersAndSort();
    try { this.cdr.detectChanges(); } catch (e) { /* noop */ }
  }

  get currentSort() {
    return { field: this.sortConfig.field, direction: this.sortConfig.dir };
  }

  loadMoreStudents(): void {
    this.displayLimit += 50;
    this.applyFiltersAndSort();
    this.cdr.detectChanges();
  }

  selectStudent(student: Student) {
    this.selectedStudent = this.selectedStudent?.id === student.id ? null : student;
  }

  isStudentSelected(student: Student): boolean {
    return this.selectedStudent?.id === student.id;
  }

  toggleMobileFilters() {
    this.showMobileFilters = !this.showMobileFilters;
  }

  setViewMode(mode: 'table' | 'cards' | 'list' | 'grid') {
    this.viewMode = mode;
  }

  detectViewMode() {
    this.viewMode = window.innerWidth < 768 ? 'cards' : 'table';
  }

  checkScrollIndicator() {
    setTimeout(() => {
      const tableContainer = document.querySelector('.table-scroll-container');
      if (tableContainer) this.showScrollIndicator = tableContainer.scrollWidth > tableContainer.clientWidth;
    }, 100);
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'transferred': return 'status-transferred';
      default: return '';
    }
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'active': return '✅';
      case 'inactive': return '⏸️';
      case 'transferred': return '📤';
      default: return '❓';
    }
  }

  getActiveCount(): number {
    return this.students.filter(s => s.status === 'active').length;
  }

  // Placeholder actions
  addNewStudent() { try { console.debug && console.debug('addNewStudent clicked'); } catch (e) {} this.openAddForm(); }
  viewStudent(student: Student) { console.log('View', student); }
  editStudent(student: Student) { console.log('Edit', student); }
  showMoreActions(student: Student) { console.log('Actions', student); }

  trackByStudentId(_i: number, s: Student): number {
    return s.id;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.detectViewMode();
    this.checkScrollIndicator();
  }
}


