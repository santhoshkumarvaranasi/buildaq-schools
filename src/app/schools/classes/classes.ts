import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ClassSchedule {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface Class {
  id: number;
  name: string;
  code: string;
  description: string;
  department: string;
  teacherId: number;
  teacherName: string;
  credits: number;
  maxStudents: number;
  enrolledStudents: number;
  semester: string;
  year: number;
  schedule: ClassSchedule[];
  status: 'active' | 'cancelled' | 'completed' | 'draft';
  startDate: Date;
  endDate: Date;
  prerequisites?: string[];
  materials?: string[];
  gradeDistribution: {
    assignments: number;
    midterm: number;
    final: number;
    participation: number;
  };
}

export interface Enrollment {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  enrollmentDate: Date;
  status: 'enrolled' | 'waitlisted' | 'dropped' | 'completed';
  grade?: string;
  attendance: number; // percentage
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classes.html',
  styleUrls: ['./classes.scss']
})
export class ClassesComponent {
  classes: Class[] = [
    {
      id: 1,
      name: 'Advanced Mathematics',
      code: 'MATH301',
      description: 'Advanced topics in calculus and linear algebra',
      department: 'Mathematics',
      teacherId: 1,
      teacherName: 'Sarah Johnson',
      credits: 4,
      maxStudents: 30,
      enrolledStudents: 28,
      semester: 'Fall',
      year: 2025,
      schedule: [
        { day: 'Monday', startTime: '09:00', endTime: '10:30', room: 'MATH-101' },
        { day: 'Wednesday', startTime: '09:00', endTime: '10:30', room: 'MATH-101' },
        { day: 'Friday', startTime: '09:00', endTime: '10:30', room: 'MATH-101' }
      ],
      status: 'active',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-12-15'),
      prerequisites: ['MATH201', 'MATH202'],
      materials: ['Textbook: Advanced Calculus', 'Scientific Calculator', 'Graphing Software License'],
      gradeDistribution: {
        assignments: 30,
        midterm: 25,
        final: 35,
        participation: 10
      }
    },
    {
      id: 2,
      name: 'Organic Chemistry',
      code: 'CHEM301',
      description: 'Study of carbon-containing compounds and their reactions',
      department: 'Science',
      teacherId: 2,
      teacherName: 'Michael Chen',
      credits: 5,
      maxStudents: 24,
      enrolledStudents: 22,
      semester: 'Fall',
      year: 2025,
      schedule: [
        { day: 'Tuesday', startTime: '10:00', endTime: '12:00', room: 'SCI-201' },
        { day: 'Thursday', startTime: '10:00', endTime: '12:00', room: 'SCI-201' },
        { day: 'Friday', startTime: '14:00', endTime: '17:00', room: 'LAB-A' }
      ],
      status: 'active',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-12-15'),
      prerequisites: ['CHEM201', 'CHEM202'],
      materials: ['Lab Manual', 'Safety Goggles', 'Lab Coat', 'Molecular Model Kit'],
      gradeDistribution: {
        assignments: 25,
        midterm: 20,
        final: 35,
        participation: 20
      }
    },
    {
      id: 3,
      name: 'Contemporary Literature',
      code: 'ENG301',
      description: 'Modern and postmodern literature analysis',
      department: 'English',
      teacherId: 3,
      teacherName: 'Emily Davis',
      credits: 3,
      maxStudents: 25,
      enrolledStudents: 20,
      semester: 'Fall',
      year: 2025,
      schedule: [
        { day: 'Monday', startTime: '14:00', endTime: '15:30', room: 'ENG-102' },
        { day: 'Wednesday', startTime: '14:00', endTime: '15:30', room: 'ENG-102' }
      ],
      status: 'active',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-12-15'),
      prerequisites: ['ENG201'],
      materials: ['Course Reader', 'Selected Novels (5)', 'MLA Style Guide'],
      gradeDistribution: {
        assignments: 40,
        midterm: 20,
        final: 25,
        participation: 15
      }
    },
    {
      id: 4,
      name: 'World History Seminar',
      code: 'HIST401',
      description: 'Advanced seminar on global historical perspectives',
      department: 'History',
      teacherId: 4,
      teacherName: 'Robert Williams',
      credits: 3,
      maxStudents: 20,
      enrolledStudents: 18,
      semester: 'Fall',
      year: 2025,
      schedule: [
        { day: 'Tuesday', startTime: '15:30', endTime: '17:00', room: 'HIST-201' },
        { day: 'Thursday', startTime: '15:30', endTime: '17:00', room: 'HIST-201' }
      ],
      status: 'active',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-12-15'),
      prerequisites: ['HIST301'],
      materials: ['Primary Source Reader', 'Research Database Access'],
      gradeDistribution: {
        assignments: 50,
        midterm: 15,
        final: 25,
        participation: 10
      }
    },
    {
      id: 5,
      name: 'Digital Art Studio',
      code: 'ART301',
      description: 'Advanced digital art techniques and portfolio development',
      department: 'Art',
      teacherId: 5,
      teacherName: 'Lisa Anderson',
      credits: 3,
      maxStudents: 16,
      enrolledStudents: 12,
      semester: 'Fall',
      year: 2025,
      schedule: [
        { day: 'Monday', startTime: '10:00', endTime: '13:00', room: 'ART-STUDIO' },
        { day: 'Wednesday', startTime: '10:00', endTime: '13:00', room: 'ART-STUDIO' }
      ],
      status: 'active',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-12-15'),
      prerequisites: ['ART201'],
      materials: ['Adobe Creative Suite License', 'Graphics Tablet', 'Portfolio Binder'],
      gradeDistribution: {
        assignments: 60,
        midterm: 15,
        final: 20,
        participation: 5
      }
    },
    {
      id: 6,
      name: 'Introduction to Philosophy',
      code: 'PHIL101',
      description: 'Fundamental concepts in Western and Eastern philosophy',
      department: 'Philosophy',
      teacherId: 7,
      teacherName: 'Dr. James Peterson',
      credits: 3,
      maxStudents: 35,
      enrolledStudents: 32,
      semester: 'Fall',
      year: 2025,
      schedule: [
        { day: 'Tuesday', startTime: '11:00', endTime: '12:30', room: 'PHIL-101' },
        { day: 'Thursday', startTime: '11:00', endTime: '12:30', room: 'PHIL-101' }
      ],
      status: 'active',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-12-15'),
      prerequisites: [],
      materials: ['Philosophy Reader', 'Notebook for Reflections'],
      gradeDistribution: {
        assignments: 35,
        midterm: 25,
        final: 30,
        participation: 10
      }
    }
  ];

  // Sample enrollments data
  enrollments: Enrollment[] = [
    {
      id: 1,
      studentId: 1,
      studentName: 'John Smith',
      classId: 1,
      enrollmentDate: new Date('2025-08-15'),
      status: 'enrolled',
      attendance: 95
    },
    {
      id: 2,
      studentId: 2,
      studentName: 'Jane Doe',
      classId: 1,
      enrollmentDate: new Date('2025-08-16'),
      status: 'enrolled',
      attendance: 92
    },
    {
      id: 3,
      studentId: 3,
      studentName: 'Mike Johnson',
      classId: 2,
      enrollmentDate: new Date('2025-08-17'),
      status: 'enrolled',
      attendance: 88
    }
  ];

  // Filter and search properties
  filteredClasses: Class[] = [...this.classes];
  searchTerm: string = '';
  selectedDepartment: string = '';
  selectedSemester: string = '';
  selectedStatus: string = '';
  
  // Mobile-specific properties
  showMobileFilters: boolean = false;
  viewMode: 'table' | 'cards' = 'table';
  selectedClass: Class | null = null;
  
  // Sorting properties
  sortField: string = 'name';
  currentSort: SortConfig = { field: 'name', direction: 'asc' };
  
  // Performance properties
  displayLimit: number = 20;
  showScrollIndicator: boolean = false;

  // Filter options
  departments = [
    'Mathematics',
    'Science', 
    'English',
    'History',
    'Art',
    'Philosophy',
    'Computer Science',
    'Foreign Languages'
  ];

  semesters = ['Fall', 'Spring', 'Summer'];
  years = [2024, 2025, 2026];

  constructor() {
    this.detectViewMode();
  }

  ngOnInit() {
    this.filterClasses();
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
    this.filterClasses();
  }

  // View mode methods
  detectViewMode() {
    this.viewMode = window.innerWidth < 768 ? 'cards' : 'table';
  }

  setViewMode(mode: 'table' | 'cards') {
    this.viewMode = mode;
  }

  // Class selection methods
  selectClass(classItem: Class) {
    this.selectedClass = this.selectedClass?.id === classItem.id ? null : classItem;
  }

  isClassSelected(classItem: Class): boolean {
    return this.selectedClass?.id === classItem.id;
  }

  trackByClassId(index: number, classItem: Class): number {
    return classItem.id;
  }

  // Sorting methods
  sortByField(field: string) {
    if (this.currentSort.field === field) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort = { field, direction: 'asc' };
    }
    this.sortClasses();
  }

  sortClasses() {
    this.filteredClasses.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.currentSort.field) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'code':
          aValue = a.code.toLowerCase();
          bValue = b.code.toLowerCase();
          break;
        case 'department':
          aValue = a.department.toLowerCase();
          bValue = b.department.toLowerCase();
          break;
        case 'teacher':
          aValue = a.teacherName.toLowerCase();
          bValue = b.teacherName.toLowerCase();
          break;
        case 'credits':
          aValue = a.credits;
          bValue = b.credits;
          break;
        case 'enrollment':
          aValue = a.enrolledStudents;
          bValue = b.enrolledStudents;
          break;
        case 'capacity':
          aValue = a.enrolledStudents / a.maxStudents;
          bValue = b.enrolledStudents / b.maxStudents;
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
    this.filterClasses();
  }

  filterClasses() {
    this.filteredClasses = this.classes.filter(classItem => {
      const matchesSearch = !this.searchTerm || 
        classItem.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        classItem.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        classItem.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        classItem.department.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        classItem.teacherName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDepartment = !this.selectedDepartment || classItem.department === this.selectedDepartment;
      const matchesSemester = !this.selectedSemester || classItem.semester === this.selectedSemester;
      const matchesStatus = !this.selectedStatus || classItem.status === this.selectedStatus;

      return matchesSearch && matchesDepartment && matchesSemester && matchesStatus;
    });

    // Apply current sorting
    this.sortClasses();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.selectedSemester = '';
    this.selectedStatus = '';
    this.filterClasses();
  }

  // Status and display methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      case 'draft': return 'status-draft';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return '✅';
      case 'cancelled': return '❌';
      case 'completed': return '🎓';
      case 'draft': return '📝';
      default: return '❓';
    }
  }

  getCapacityPercentage(classItem: Class): number {
    return Math.round((classItem.enrolledStudents / classItem.maxStudents) * 100);
  }

  getCapacityClass(classItem: Class): string {
    const percentage = this.getCapacityPercentage(classItem);
    if (percentage >= 90) return 'capacity-full';
    if (percentage >= 75) return 'capacity-high';
    if (percentage >= 50) return 'capacity-medium';
    return 'capacity-low';
  }

  getActiveCount(): number {
    return this.classes.filter(classItem => classItem.status === 'active').length;
  }

  getTotalEnrollments(): number {
    return this.classes.reduce((sum, classItem) => sum + classItem.enrolledStudents, 0);
  }

  getAverageCapacity(): number {
    const total = this.classes.reduce((sum, classItem) => sum + this.getCapacityPercentage(classItem), 0);
    return Math.round(total / this.classes.length);
  }

  getDepartmentCount(): number {
    return new Set(this.classes.map(classItem => classItem.department)).size;
  }

  // Utility methods
  formatSchedule(schedule: ClassSchedule[]): string {
    return schedule.map(s => `${s.day} ${s.startTime}-${s.endTime}`).join(', ');
  }

  formatPrerequisites(prerequisites?: string[]): string {
    return prerequisites ? prerequisites.join(', ') : 'None';
  }

  getEnrollmentStatus(classItem: Class): string {
    const percentage = this.getCapacityPercentage(classItem);
    if (percentage >= 100) return 'Full';
    if (percentage >= 90) return 'Almost Full';
    return 'Open';
  }

  // Performance methods
  loadMoreClasses() {
    this.displayLimit += 20;
  }

  // Action methods
  editClass(classItem: Class) {
    console.log('Edit class:', classItem);
  }

  viewClass(classItem: Class) {
    console.log('View class:', classItem);
  }

  addClass() {
    console.log('Add new class');
  }

  manageEnrollment(classItem: Class) {
    console.log('Manage enrollment for class:', classItem);
  }

  viewSchedule(classItem: Class) {
    console.log('View schedule for class:', classItem);
  }

  duplicateClass(classItem: Class) {
    console.log('Duplicate class:', classItem);
  }

  exportClassList() {
    console.log('Export class list');
  }

  generateReport(classItem: Class) {
    console.log('Generate report for class:', classItem);
  }
}