import { ChangeDetectorRef, Component, HostListener, NgZone, OnInit, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../core/services/tenant.service';
import { MockDataService, MockStudent } from '../../core/services/mock-data.service';

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
    private mock: MockDataService,
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
    try {
      const arr = this.mock.getStudents() as MockStudent[];
      const mapped = arr.map((s: any) => {
        return {
          id: s.id,
          rollNo: s.rollNo ?? s.roll_number ?? s.roll,
          firstName: s.firstName,
          lastName: s.lastName,
          fullName: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          grade: s.grade,
          class: s.class,
          section: s.section,
          status: s.status || 'active',
          email: s.email,
          enrollmentDate: s.enrollmentDate,
          schoolId: s.schoolId ?? null
        } as Student;
      });

      this.zone.run(() => {
        this.students = mapped;
        this.grades = Array.from(new Set(this.students.map((st) => st.grade).filter(Boolean))) as string[];
        this.applyFiltersAndSort();
        this.isLoading = false;
        setTimeout(() => this.cdr.detectChanges(), 0);
      });
    } catch (err) {
      console.error('Failed to load mock students', err);
      this.zone.run(() => { this.isLoading = false; this.cdr.detectChanges(); });
    }
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
    payload.address = {
      line1: this.newStudent.addressLine1 ?? null,
      line2: this.newStudent.addressLine2 ?? null,
      city: this.newStudent.addressCity ?? null,
      state: this.newStudent.addressState ?? null,
      postalCode: this.newStudent.addressPostalCode ?? null,
    };
    payload.emergencyContact = {
      name: this.newStudent.emergencyContactName ?? null,
      phone: this.newStudent.emergencyContactPhone ?? null,
      relation: this.newStudent.emergencyContactRelation ?? null,
    };
    if (this.newStudent.dateOfBirth) payload.dateOfBirth = new Date(this.newStudent.dateOfBirth as any).toISOString();
    if (this.newStudent.enrollmentDate) payload.enrollmentDate = new Date(this.newStudent.enrollmentDate as any).toISOString();

    try {
      const created = this.mock.createStudent(payload as any);
      const s = Object.assign({}, created) as Student;
      s.fullName = s.fullName ?? `${s.firstName || ''} ${s.lastName || ''}`.trim();
      this.students.unshift(s);
      this.applyFiltersAndSort();
      this.showAddForm = false;
    } catch (err) {
      console.error('Failed to create student (mock)', err);
      alert('Failed to create student: ' + (((err as any)?.message) ?? String(err) ?? 'Unknown error'));
    } finally {
      this.isSubmitting = false;
      try { this.cdr.detectChanges(); } catch (e) {}
    }
  }

  // In-memory edit/delete support
  editStudent(student: Student) {
    // populate newStudent with selected student for editing
    this.selectedStudent = student;
    this.newStudent = Object.assign({}, student);
    this.showAddForm = true;
  }

  updateStudent() {
    if (!this.selectedStudent) return;
    const id = this.selectedStudent.id;
    const changes = { ...this.newStudent } as any;
    try {
      const updated = this.mock.updateStudent(id, changes as any);
      if (updated) {
        const idx = this.students.findIndex(s => s.id === id);
        if (idx !== -1) this.students[idx] = Object.assign({}, this.students[idx], updated as any);
        this.applyFiltersAndSort();
        this.showAddForm = false;
        this.selectedStudent = null;
      } else {
        alert('Failed to update (not found)');
      }
    } catch (err) {
      console.error('Failed to update mock student', err);
      alert('Failed to update student');
    }
  }

  deleteStudentById(id: number) {
    if (!confirm('Delete this student?')) return;
    const ok = this.mock.deleteStudent(id);
    if (ok) {
      this.students = this.students.filter(s => s.id !== id);
      this.applyFiltersAndSort();
    } else {
      alert('Failed to delete student');
    }
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

  // Action aliases used by templates
  addNewStudent() { this.openAddForm(); }
  viewStudent(student: Student) { console.log('View', student); }
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


