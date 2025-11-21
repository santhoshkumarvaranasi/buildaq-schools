import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolsService, RemoteStudent } from '../schools.service';
import { TenantService } from '../../core/services/tenant.service';

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  class: string;
  enrollmentDate: Date;
  status: 'active' | 'inactive' | 'transferred';
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
  styleUrl: './students.scss',
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];

  // Filter and search properties
  filteredStudents: Student[] = [...this.students];
  searchTerm: string = '';
  selectedGrade: string = '';
  selectedStatus: string = '';
  
  // Mobile-specific properties
  showMobileFilters: boolean = false;
  viewMode: 'table' | 'cards' = 'table';
  selectedStudent: Student | null = null;
  
  // Sorting properties
  sortField: string = 'name';
  currentSort: SortConfig = { field: 'name', direction: 'asc' };
  
  // Performance properties
  displayLimit: number = 20;
  showScrollIndicator: boolean = false;

  constructor(private schoolsService: SchoolsService, private tenantService: TenantService) {
    this.detectViewMode();
  }

  ngOnInit() {
    this.loadStudents();
    this.checkScrollIndicator();
  }

  // Load students from API
  async loadStudents() {
    try {
      const remote = (await this.schoolsService.getStudents().toPromise()) || [];
      // Map remote shape to local Student model
      this.students = remote.map((s: RemoteStudent) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        grade: s.grade,
        class: s.class,
        enrollmentDate: new Date(s.enrollmentDate),
        status: s.status
      }));
      this.filterStudents();
    } catch (e) {
      console.error('Error loading students', e);
      // Fallback to existing empty list
      this.students = [];
      this.filterStudents();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.detectViewMode();
    this.checkScrollIndicator();
  }

  // Scroll indicator methods
  checkScrollIndicator() {
    setTimeout(() => {
      const tableContainer = document.querySelector('.table-scroll-container');
      if (tableContainer) {
        this.showScrollIndicator = tableContainer.scrollWidth > tableContainer.clientWidth;
      }
    }, 100);
  }

  // Mobile filter methods
  toggleMobileFilters() {
    this.showMobileFilters = !this.showMobileFilters;
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterStudents();
  }

  // View mode methods
  detectViewMode() {
    this.viewMode = window.innerWidth < 768 ? 'cards' : 'table';
  }

  setViewMode(mode: 'table' | 'cards') {
    this.viewMode = mode;
  }

  // Student selection methods
  selectStudent(student: Student) {
    this.selectedStudent = this.selectedStudent?.id === student.id ? null : student;
  }

  isStudentSelected(student: Student): boolean {
    return this.selectedStudent?.id === student.id;
  }

  trackByStudentId(index: number, student: Student): number {
    return student.id;
  }

  // Sorting methods
  sortByField(field: string) {
    if (this.currentSort.field === field) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort = { field, direction: 'asc' };
    }
    this.sortStudents();
  }

  sortStudents() {
    this.filteredStudents.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.currentSort.field) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'grade':
          aValue = a.grade;
          bValue = b.grade;
          break;
        case 'enrollment':
          aValue = a.enrollmentDate.getTime();
          bValue = b.enrollmentDate.getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return this.currentSort.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.currentSort.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Filter and search methods
  onSearch() {
    this.filterStudents();
  }

  filterStudents() {
    this.filteredStudents = this.students.filter(student => {
      const matchesSearch = !this.searchTerm || 
        student.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.grade.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesGrade = !this.selectedGrade || student.grade === this.selectedGrade;
      const matchesStatus = !this.selectedStatus || student.status === this.selectedStatus;

      return matchesSearch && matchesGrade && matchesStatus;
    });

    // Apply current sorting
    this.sortStudents();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedGrade = '';
    this.selectedStatus = '';
    this.filterStudents();
  }

  // Status and display methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'transferred': return 'status-transferred';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return '✅';
      case 'inactive': return '⏸️';
      case 'transferred': return '📤';
      default: return '❓';
    }
  }

  getActiveCount(): number {
    return this.students.filter(student => student.status === 'active').length;
  }

  // Performance methods
  loadMoreStudents() {
    this.displayLimit += 20;
  }

  // Touch and swipe methods
  onSwipeLeft(student: Student) {
    // Email action
    window.open(`mailto:${student.email}`, '_blank');
  }

  onSwipeRight(student: Student) {
    // Edit action
    this.editStudent(student);
  }

  // Action methods
  editStudent(student: Student) {
    // TODO: Open edit dialog
    console.log('Edit student:', student);
  }

  viewStudent(student: Student) {
    // TODO: Open student details
    console.log('View student:', student);
  }

  addNewStudent() {
    // TODO: Open add student dialog
    console.log('Add new student');
  }

  showMoreActions(student: Student) {
    // TODO: Show action menu
    console.log('More actions for student:', student);
  }
}