import { Injectable } from '@angular/core';

export interface MockStudent {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  grade?: string;
  section?: string;
  class?: string;
  enrollmentDate?: string;
  status?: string;
  rollNo?: string;
  schoolId?: number;
  // allow additional flexible fields used by components
  [key: string]: any;
}

export interface MockStaff {
  id: number;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  students: MockStudent[] = [
    { id: 1, firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', grade: '10', section: 'A', class: '10A', enrollmentDate: '2023-06-01', status: 'active' },
    { id: 2, firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com', grade: '9', section: 'B', class: '9B', enrollmentDate: '2022-08-15', status: 'active' },
    { id: 3, firstName: 'Priya', lastName: 'Kumar', email: 'priya.kumar@example.com', grade: '11', section: 'A', class: '11A', enrollmentDate: '2021-04-10', status: 'inactive' }
  ];

  staff: MockStaff[] = [
    { id: 1, name: 'Alice Brown', role: 'Teacher', email: 'alice.brown@example.com', phone: '+1-555-1001' },
    { id: 2, name: 'Robert Green', role: 'Accountant', email: 'robert.green@example.com' }
  ];

  classes = [
    { id: '10A', name: 'Class 10 A', capacity: 40, teacher: 'Alice Brown' },
    { id: '9B', name: 'Class 9 B', capacity: 38, teacher: 'Robert Green' }
  ];

  fees = [
    { studentId: 1, balance: 1200, lastPaid: '2025-03-15' },
    { studentId: 2, balance: 0, lastPaid: '2025-06-01' }
  ];

  attendance = [
    { id: 1, studentId: 1, date: '2025-11-20', status: 'present' },
    { id: 2, studentId: 2, date: '2025-11-20', status: 'absent' }
  ];

  getStudents() { return this.students; }
  getStaff() { return this.staff; }
  getClasses() { return this.classes; }
  getFees() { return this.fees; }
  getAttendance() { return this.attendance; }

  // Create a new student in-memory and return it
  createStudent(payload: Partial<MockStudent>): MockStudent {
    const nextId = (this.students.reduce((m, s) => Math.max(m, s.id), 0) || 0) + 1;
    const created: MockStudent = Object.assign({ id: nextId, status: 'active' }, payload) as MockStudent;
    // ensure strings
    created.firstName = created.firstName || '';
    created.lastName = created.lastName || '';
    this.students.unshift(created);
    return created;
  }

  updateStudent(id: number, changes: Partial<MockStudent>): MockStudent | null {
    const idx = this.students.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const updated = Object.assign({}, this.students[idx], changes);
    this.students[idx] = updated;
    return updated;
  }

  deleteStudent(id: number): boolean {
    const idx = this.students.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.students.splice(idx, 1);
    return true;
  }

  // Staff CRUD
  createStaff(payload: Partial<MockStaff>): MockStaff {
    const nextId = (this.staff.reduce((m, s) => Math.max(m, s.id), 0) || 0) + 1;
    const created: MockStaff = Object.assign({ id: nextId }, payload) as MockStaff;
    created.name = created.name || '';
    this.staff.unshift(created);
    return created;
  }

  updateStaff(id: number, changes: Partial<MockStaff>): MockStaff | null {
    const idx = this.staff.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const updated = Object.assign({}, this.staff[idx], changes);
    this.staff[idx] = updated;
    return updated;
  }

  deleteStaff(id: number): boolean {
    const idx = this.staff.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.staff.splice(idx, 1);
    return true;
  }
}
