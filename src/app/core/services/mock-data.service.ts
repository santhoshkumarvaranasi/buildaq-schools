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

export interface BehaviorIncident {
  id: number;
  studentId: number;
  studentName: string;
  class: string;
  date: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  actionTaken: string;
  staff: string;
  followUpDate?: string;
  parentNotified?: boolean;
}

export interface Announcement {
  id: number;
  title: string;
  audience: 'all' | 'students' | 'teachers';
  priority: 'low' | 'normal' | 'high';
  date: string;
  author: string;
  body: string;
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
  discounts = [
    { id: 'D-001', studentId: 1, studentName: 'Jane Doe', type: 'Scholarship', amount: 200, reason: 'Merit', validUntil: '2025-12-31', status: 'active' },
    { id: 'D-002', studentId: 2, studentName: 'John Smith', type: 'Sibling', amount: 150, reason: 'Sibling concession', validUntil: '2025-09-30', status: 'active' }
  ];
  receipts = [
    { id: 'R-1001', studentId: 1, studentName: 'Jane Doe', date: '2025-06-01', amount: 1200, method: 'Online' },
    { id: 'R-1002', studentId: 2, studentName: 'John Smith', date: '2025-06-02', amount: 800, method: 'Cash' }
  ];

  attendance = [
    { id: 1, studentId: 1, date: '2025-11-20', status: 'present' },
    { id: 2, studentId: 2, date: '2025-11-20', status: 'absent' }
  ];

  // Timetable entries
  timetable = [
    { id: 1, classId: '10A', subject: 'Mathematics', teacher: 'Alice Brown', day: 'Mon', time: '09:00' },
    { id: 2, classId: '9B', subject: 'Science', teacher: 'Robert Green', day: 'Tue', time: '10:00' }
  ];

  // Exams and marks
  exams = [
    { id: 1, title: 'Midterm 2025', date: '2025-10-15', studentMarks: [{ studentId: 1, marks: 78 }, { studentId: 2, marks: 85 }] }
  ];

  admissions = [
    { id: 1, name: 'Ravi Patel', class: '8A', status: 'new', submitted: '2025-06-10', notes: 'Needs guardian contact' },
    { id: 2, name: 'Sara Lee', class: '9B', status: 'verified', submitted: '2025-06-05', notes: 'All docs uploaded' }
  ];

  behaviorIncidents: BehaviorIncident[] = [
    { id: 1, studentId: 1, studentName: 'Jane Doe', class: '10A', date: '2025-11-10', type: 'Late submission', severity: 'low', actionTaken: 'Reminder sent', staff: 'Alice Brown', followUpDate: '2025-11-20', parentNotified: false },
    { id: 2, studentId: 1, studentName: 'Jane Doe', class: '10A', date: '2025-11-18', type: 'Class disruption', severity: 'medium', actionTaken: 'Counseling scheduled', staff: 'Alice Brown', followUpDate: '2025-11-25', parentNotified: true },
    { id: 3, studentId: 2, studentName: 'John Smith', class: '9B', date: '2025-11-05', type: 'Absence', severity: 'low', actionTaken: 'Called guardian', staff: 'Robert Green', followUpDate: '2025-11-12', parentNotified: true },
    { id: 4, studentId: 3, studentName: 'Priya Kumar', class: '11A', date: '2025-10-28', type: 'Cheating', severity: 'high', actionTaken: 'Incident report filed', staff: 'Robert Green', followUpDate: '2025-11-05', parentNotified: true }
  ];

  announcements: Announcement[] = [
    { id: 1, title: 'PTA Meeting', audience: 'all', priority: 'normal', date: '2025-12-05', author: 'Principal', body: 'Parent Teacher meeting at 4 PM in auditorium.' },
    { id: 2, title: 'Exam Schedule', audience: 'students', priority: 'high', date: '2025-12-10', author: 'Exam Cell', body: 'Midterm schedule released. Check Exams page.' },
    { id: 3, title: 'Workshop Invite', audience: 'teachers', priority: 'low', date: '2025-11-28', author: 'Academics', body: 'Teaching with AI tools workshop in Lab 2.' }
  ];

  getStudents() { return this.students; }
  getStaff() { return this.staff; }
  getClasses() { return this.classes; }
  getFees() { return this.fees; }
  getAttendance() { return this.attendance; }
  getTimetable() { return this.timetable; }
  getExams() { return this.exams; }
  getDiscounts() { return this.discounts; }
  getReceipts() { return this.receipts; }
  getBehaviorIncidents(): (BehaviorIncident & { isRepeat: boolean })[] {
    const counts: Record<number, number> = {};
    this.behaviorIncidents.forEach(b => { counts[b.studentId] = (counts[b.studentId] || 0) + 1; });
    return this.behaviorIncidents.map(b => Object.assign({}, b, { isRepeat: (counts[b.studentId] || 0) > 1 }));
  }
  addBehaviorIncident(entry: Partial<BehaviorIncident>) {
    const nextId = (this.behaviorIncidents.reduce((m, i) => Math.max(m, i.id), 0) || 0) + 1;
    const student = this.students.find(s => s.id === entry.studentId);
    const created: BehaviorIncident = Object.assign({
      id: nextId,
      studentId: entry.studentId || 0,
      studentName: entry.studentName || (student ? `${student.firstName} ${student.lastName}` : 'Unknown'),
      class: entry.class || (student ? student.class || '' : ''),
      date: entry.date || new Date().toISOString().slice(0, 10),
      type: entry.type || 'General',
      severity: (entry.severity as any) || 'medium',
      actionTaken: entry.actionTaken || 'Logged',
      staff: entry.staff || 'Counselor',
      followUpDate: entry.followUpDate,
      parentNotified: !!entry.parentNotified
    });
    this.behaviorIncidents.unshift(created);
    return created;
  }
  getAnnouncements() { return this.announcements; }
  addAnnouncement(entry: Partial<Announcement>) {
    const nextId = (this.announcements.reduce((m, a) => Math.max(m, a.id), 0) || 0) + 1;
    const created: Announcement = Object.assign({
      id: nextId,
      title: entry.title || 'Untitled',
      audience: (entry.audience as any) || 'all',
      priority: (entry.priority as any) || 'normal',
      date: entry.date || new Date().toISOString().slice(0, 10),
      author: entry.author || 'Admin',
      body: entry.body || ''
    });
    this.announcements.unshift(created);
    return created;
  }
  addDiscount(entry: any) {
    const created = Object.assign({ id: `D-${(this.discounts.length + 1).toString().padStart(3,'0')}`, status: 'active' }, entry);
    this.discounts.unshift(created);
    return created;
  }
  updateDiscountStatus(id: string, status: string) {
    const idx = this.discounts.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.discounts[idx].status = status;
    return this.discounts[idx];
  }
  getAdmissions() { return this.admissions; }
  updateAdmission(id: number, status: string) {
    const idx = this.admissions.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.admissions[idx].status = status;
    return this.admissions[idx];
  }

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

  // Attendance helpers
  addAttendance(studentId: number, date: string, status: string) {
    const nextId = (this.attendance.reduce((m, a) => Math.max(m, a.id), 0) || 0) + 1;
    const entry = { id: nextId, studentId, date, status } as any;
    this.attendance.unshift(entry);
    return entry;
  }

  updateAttendanceStatus(id: number, status: string) {
    const idx = this.attendance.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.attendance[idx].status = status;
    return this.attendance[idx];
  }

  // Fees helpers: apply a payment to a student's balance
  payFee(studentId: number, amount: number, date: string) {
    const idx = this.fees.findIndex(x => x.studentId === studentId);
    if (idx === -1) {
      const f = { studentId, balance: Math.max(0, 0 - amount), lastPaid: date } as any;
      this.fees.unshift(f);
      return f;
    }
    const f = this.fees[idx] as any;
    f.balance = Math.max(0, (f.balance || 0) - amount);
    f.lastPaid = date;
    return f;
  }

  // Timetable helpers
  addTimetableEntry(entry: any) {
    const nextId = (this.timetable.reduce((m, t) => Math.max(m, t.id), 0) || 0) + 1;
    const created = Object.assign({ id: nextId }, entry);
    this.timetable.unshift(created);
    return created;
  }

  deleteTimetableEntry(id: number) {
    const idx = this.timetable.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.timetable.splice(idx, 1);
    return true;
  }

  // Exams helpers
  createExam(title: string, date: string, studentIds: number[]) {
    const nextId = (this.exams.reduce((m, e) => Math.max(m, e.id), 0) || 0) + 1;
    const studentMarks = studentIds.map(id => ({ studentId: id, marks: null }));
    const created = { id: nextId, title, date, studentMarks } as any;
    this.exams.unshift(created);
    return created;
  }

  recordMarks(examId: number, marks: { studentId: number; marks: number }[]) {
    const ex = this.exams.find(e => e.id === examId);
    if (!ex) return null;
    marks.forEach(m => {
      const sm = ex.studentMarks.find((s: any) => s.studentId === m.studentId);
      if (sm) sm.marks = m.marks; else ex.studentMarks.push({ studentId: m.studentId, marks: m.marks });
    });
    return ex;
  }
}
