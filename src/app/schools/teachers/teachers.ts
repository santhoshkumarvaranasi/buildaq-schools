import { Component, HostListener, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  imports: [CommonModule, FormsModule, HttpClientModule],
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

  constructor(private http: HttpClient, private zone: NgZone, private cdr: ChangeDetectorRef) {
    this.detectViewMode();
  }

  ngOnInit() {
    this.fetchTeachers();
    this.checkScrollIndicator();
  }

  fetchTeachers() {
    const url = `${environment.apiUrl}/${environment.apiVersion}/teachers/summary`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        if (!Array.isArray(data)) {
          console.warn('Unexpected teachers response, expected array', data);
          data = [];
        }
        const deptSet = new Set<string>();
        this.teachers = data.map((t: any) => {
          const dept = Array.isArray(t.departments) && t.departments.length > 0 ? t.departments[0] : (t.department || '');
          if (dept) deptSet.add(dept);

          const subjects: Subject[] = Array.isArray(t.subjects)
            ? t.subjects.map((s: any) => ({ id: String(s), name: String(s), code: String(s), credits: 0 }))
            : (t.subjects || []);

          const teacher: Teacher = {
            id: t.id,
            firstName: t.firstName || (t.fullName ? (t.fullName.split(' ')[0] || '') : ''),
            lastName: t.lastName || '',
            email: t.email || '',
            phone: t.phone || '',
            department: dept,
            subjects,
            hireDate: t.hireDate ? new Date(t.hireDate) : new Date(),
            status: (t.status as any) || 'active',
            experience: t.experience ?? 0,
            qualification: t.qualification || '',
            salary: t.salary ?? 0,
            avatar: t.avatar || undefined
          };

          return teacher;
        });

        // populate departments dropdown from unique departments found
        try {
          this.zone.run(() => {
            this.departments = Array.from(deptSet).sort();
            this.filterTeachers();
          });
        } catch (e) {
          this.departments = Array.from(deptSet).sort();
          this.filterTeachers();
        }

        // Ensure template updates reliably
        try { setTimeout(() => { try { this.cdr.detectChanges(); } catch (e) {} }, 0); } catch (e) { try { this.cdr.detectChanges(); } catch (e) {} }
      },
      error: (err) => {
        console.error('Failed to load teachers summary', err);
      }
    });
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
    // TODO: Open edit dialog
    console.log('Edit teacher:', teacher);
  }

  viewTeacher(teacher: Teacher) {
    // TODO: Open teacher details
    console.log('View teacher:', teacher);
  }

  addNewTeacher() {
    // TODO: Open add teacher dialog
    console.log('Add new teacher');
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
}