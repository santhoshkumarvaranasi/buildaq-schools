import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers.html',
  styleUrls: ['./teachers.scss']
})
export class TeachersComponent implements OnInit {
  teachers: Teacher[] = [
    {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@school.edu',
      phone: '+1 (555) 123-4567',
      department: 'Mathematics',
      subjects: [
        { id: 'MATH101', name: 'Algebra I', code: 'ALG1', credits: 3 },
        { id: 'MATH201', name: 'Geometry', code: 'GEO1', credits: 3 }
      ],
      hireDate: new Date('2020-08-15'),
      status: 'active',
      experience: 8,
      qualification: 'M.S. Mathematics',
      salary: 65000
    },
    {
      id: 2,
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@school.edu',
      phone: '+1 (555) 234-5678',
      department: 'Science',
      subjects: [
        { id: 'SCI101', name: 'Biology I', code: 'BIO1', credits: 4 },
        { id: 'SCI201', name: 'Chemistry I', code: 'CHEM1', credits: 4 }
      ],
      hireDate: new Date('2019-01-10'),
      status: 'active',
      experience: 12,
      qualification: 'Ph.D. Biology',
      salary: 72000
    },
    {
      id: 3,
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@school.edu',
      phone: '+1 (555) 345-6789',
      department: 'English',
      subjects: [
        { id: 'ENG101', name: 'English Literature', code: 'LIT1', credits: 3 },
        { id: 'ENG201', name: 'Creative Writing', code: 'CW1', credits: 2 }
      ],
      hireDate: new Date('2021-09-01'),
      status: 'active',
      experience: 6,
      qualification: 'M.A. English Literature',
      salary: 58000
    },
    {
      id: 4,
      firstName: 'Robert',
      lastName: 'Williams',
      email: 'robert.williams@school.edu',
      phone: '+1 (555) 456-7890',
      department: 'History',
      subjects: [
        { id: 'HIST101', name: 'World History', code: 'WH1', credits: 3 },
        { id: 'HIST201', name: 'American History', code: 'AH1', credits: 3 }
      ],
      hireDate: new Date('2018-08-20'),
      status: 'active',
      experience: 15,
      qualification: 'M.A. History',
      salary: 68000
    },
    {
      id: 5,
      firstName: 'Lisa',
      lastName: 'Anderson',
      email: 'lisa.anderson@school.edu',
      phone: '+1 (555) 567-8901',
      department: 'Art',
      subjects: [
        { id: 'ART101', name: 'Drawing & Painting', code: 'ART1', credits: 2 },
        { id: 'ART201', name: 'Digital Art', code: 'DART1', credits: 2 }
      ],
      hireDate: new Date('2022-01-15'),
      status: 'on-leave',
      experience: 4,
      qualification: 'B.F.A. Fine Arts',
      salary: 52000
    },
    {
      id: 6,
      firstName: 'David',
      lastName: 'Thompson',
      email: 'david.thompson@school.edu',
      phone: '+1 (555) 678-9012',
      department: 'Physical Education',
      subjects: [
        { id: 'PE101', name: 'Physical Education', code: 'PE1', credits: 1 },
        { id: 'PE201', name: 'Health & Wellness', code: 'HW1', credits: 1 }
      ],
      hireDate: new Date('2017-08-01'),
      status: 'active',
      experience: 10,
      qualification: 'B.S. Kinesiology',
      salary: 55000
    }
  ];

  // Filter and search properties
  filteredTeachers: Teacher[] = [...this.teachers];
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

  // Department options
  departments = [
    'Mathematics',
    'Science', 
    'English',
    'History',
    'Art',
    'Physical Education',
    'Music',
    'Foreign Languages'
  ];

  constructor() {
    this.detectViewMode();
  }

  ngOnInit() {
    this.filterTeachers();
    this.checkScrollIndicator();
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