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
  schoolId?: number;
  [key: string]: any;
}

export interface SortConfig {
  field: string;
  dir: 'asc' | 'desc';
}

@Component({
  selector: 'app-students',
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

        const mapped = arr.map((s: any) => ({
          id: s.id ?? s.studentId ?? 0,
          rollNo: s.rollNo ?? s.roll_number ?? s.roll,
          firstName: s.firstName ?? s.first_name ?? s.fname ?? s.first,
          lastName: s.lastName ?? s.last_name ?? s.lname ?? s.last,
          fullName: s.fullName ?? `${s.firstName || s.first || ''} ${s.lastName || s.last || ''}`.trim(),
          grade: s.grade ?? s.class ?? s.standard,
          section: s.section ?? s.sectionName ?? s.section_id,
          status: s.status ?? s.enrollmentStatus ?? 'active',
          email: s.email,
          enrollmentDate: s.enrollmentDate ?? s.enrollmentDateString,
          schoolId: s.schoolId ?? s.school_id,
          ...s,
        }));

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
  addNewStudent() { console.log('Add new student'); }
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


