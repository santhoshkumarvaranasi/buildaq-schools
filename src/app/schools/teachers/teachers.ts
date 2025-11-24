import { Component, HostListener, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MockDataService, MockStaff } from '../../core/services/mock-data.service';
import { MaterialModule } from '../../core/material.module';

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
}

export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  subjects: Subject[];
  hireDate: Date;
  status: 'active' | 'inactive' | 'on-leave';
  experience: number; // years
  qualification: string;
  salary: number;
  avatar?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, MaterialModule],
  templateUrl: './teachers.html',
  styleUrls: ['./teachers.scss']
})
export class TeachersComponent implements OnInit {
  teachers: Teacher[] = [];

  // Filter and search properties
  filteredTeachers: Teacher[] = [];
  searchTerm: string = '';
  selectedDepartment: string = '';
  selectedStatus: string = '';
  
  // Mobile-specific properties
  showMobileFilters: boolean = false;
  viewMode: 'table' | 'cards' = 'table';
  selectedTeacher: Teacher | null = null;
  
  // Sorting properties
  sortField: string = 'lastName';
  currentSort: SortConfig = { field: 'lastName', direction: 'asc' };
  
  // Performance properties
  displayLimit: number = 20;
  showScrollIndicator: boolean = false;

  // Department options (populated from API)
  departments: string[] = [];

  constructor(private mock: MockDataService, private zone: NgZone, private cdr: ChangeDetectorRef) {
    this.detectViewMode();
  }

  ngOnInit() {
    this.fetchTeachers();
    this.checkScrollIndicator();
  }

  fetchTeachers() {
    try {
      const data = this.mock.getStaff();
      const deptSet = new Set<string>();
      this.teachers = data.map((t: any) => {
        const nameParts = (t.name || '').split(' ');
        const firstName = nameParts.shift() || '';
        const lastName = nameParts.join(' ') || '';
        const teacher: Teacher = {
          id: t.id,
          firstName,
          lastName,
          email: t.email || '',
          phone: t.phone || '',
          department: t.role || '',
          subjects: [],
          hireDate: new Date(),
          status: 'active',
          experience: 0,
          qualification: '',
          salary: 0,
          avatar: undefined
        };
        if (teacher.department) deptSet.add(teacher.department);
        return teacher;
      });
      this.zone.run(() => { this.departments = Array.from(deptSet).sort(); this.filterTeachers(); });
    } catch (err) {
      console.error('Failed to load mock teachers', err);
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
    this.filterTeachers();
  }

  // View mode methods
  detectViewMode() {
    this.viewMode = window.innerWidth < 768 ? 'cards' : 'table';
  }

  setViewMode(mode: 'table' | 'cards') {
    this.viewMode = mode;
  }

  // Teacher selection methods
  selectTeacher(teacher: Teacher) {
    this.selectedTeacher = this.selectedTeacher?.id === teacher.id ? null : teacher;
  }

  isTeacherSelected(teacher: Teacher): boolean {
    return this.selectedTeacher?.id === teacher.id;
  }

  trackByTeacherId(index: number, teacher: Teacher): number {
    return teacher.id;
  }

  // Sorting methods
  sortByField(field: string) {
    if (this.currentSort.field === field) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort = { field, direction: 'asc' };
    }
    this.sortTeachers();
  }

  sortTeachers() {
    this.filteredTeachers.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.currentSort.field) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'name':
        case 'lastName':
          aValue = `${a.lastName} ${a.firstName}`.toLowerCase();
          bValue = `${b.lastName} ${b.firstName}`.toLowerCase();
          break;
        case 'department':
          aValue = a.department.toLowerCase();
          bValue = b.department.toLowerCase();
          break;
        case 'experience':
          aValue = a.experience;
          bValue = b.experience;
          break;
        case 'hireDate':
          aValue = a.hireDate.getTime();
          bValue = b.hireDate.getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'salary':
          aValue = a.salary;
          bValue = b.salary;
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
    this.filterTeachers();
  }

  filterTeachers() {
    this.filteredTeachers = this.teachers.filter(teacher => {
      const matchesSearch = !this.searchTerm || 
        teacher.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        teacher.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        teacher.department.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        teacher.qualification.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        teacher.subjects.some(subject => 
          subject.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          subject.code.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      
      const matchesDepartment = !this.selectedDepartment || teacher.department === this.selectedDepartment;
      const matchesStatus = !this.selectedStatus || teacher.status === this.selectedStatus;

      return matchesSearch && matchesDepartment && matchesStatus;
    });

    // Apply current sorting
    this.sortTeachers();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.selectedStatus = '';
    this.filterTeachers();
  }

  // Status and display methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'on-leave': return 'status-on-leave';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return '✅';
      case 'inactive': return '❌';
      case 'on-leave': return '🏖️';
      default: return '❓';
    }
  }

  getActiveCount(): number {
    return this.teachers.filter(teacher => teacher.status === 'active').length;
  }

  getDepartmentCount(): number {
    return new Set(this.teachers.map(teacher => teacher.department)).size;
  }

  getAverageExperience(): number {
    const total = this.teachers.reduce((sum, teacher) => sum + teacher.experience, 0);
    return Math.round(total / this.teachers.length * 10) / 10;
  }

  // Utility methods
  formatSalary(salary: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(salary);
  }

  getSubjectsList(subjects: Subject[]): string {
    return subjects.map(s => s.code).join(', ');
  }

  // Performance methods
  loadMoreTeachers() {
    this.displayLimit += 20;
  }

  // Touch and swipe methods
  onSwipeLeft(teacher: Teacher) {
    // Email action
    window.open(`mailto:${teacher.email}`, '_blank');
  }

  onSwipeRight(teacher: Teacher) {
    // Edit action
    this.editTeacher(teacher);
  }

  // Action methods
  editTeacher(teacher: Teacher) {
    // Open inline edit in mock mode
    const updated = this.mock.updateStaff(teacher.id, { name: `${teacher.firstName} ${teacher.lastName}`, email: teacher.email, phone: teacher.phone, role: teacher.department });
    if (updated) {
      const idx = this.teachers.findIndex(t => t.id === teacher.id);
      if (idx !== -1) this.teachers[idx] = Object.assign({}, this.teachers[idx], teacher as any);
      this.cdr.detectChanges();
    }
  }

  viewTeacher(teacher: Teacher) {
    // TODO: Open teacher details
    console.log('View teacher:', teacher);
  }

  addNewTeacher() {
    const payload: Partial<MockStaff> = { name: 'New Teacher', role: 'Teacher', email: '', phone: '' };
    const created = this.mock.createStaff(payload);
    this.teachers.unshift({
      id: created.id,
      firstName: (created.name || '').split(' ')[0] || '',
      lastName: (created.name || '').split(' ').slice(1).join(' ') || '',
      email: created.email || '',
      phone: created.phone || '',
      department: created.role || '',
      subjects: [],
      hireDate: new Date(),
      status: 'active',
      experience: 0,
      qualification: '',
      salary: 0
    } as Teacher);
    this.cdr.detectChanges();
  }

  showMoreActions(teacher: Teacher) {
    // TODO: Show action menu
    console.log('More actions for teacher:', teacher);
  }

  assignSubject(teacher: Teacher) {
    // TODO: Open subject assignment dialog
    console.log('Assign subject to teacher:', teacher);
  }

  viewSchedule(teacher: Teacher) {
    // TODO: Open teacher schedule
    console.log('View schedule for teacher:', teacher);
  }

  callTeacher(teacher: Teacher) {
    window.open(`tel:${teacher.phone}`, '_self');
  }

  deleteTeacher(teacher: Teacher) {
    if (!confirm('Delete teacher?')) return;
    const ok = this.mock.deleteStaff(teacher.id);
    if (ok) {
      this.teachers = this.teachers.filter(t => t.id !== teacher.id);
      this.cdr.detectChanges();
    } else {
      alert('Failed to delete teacher');
    }
  }
}