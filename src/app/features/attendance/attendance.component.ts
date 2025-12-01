import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MaterialModule } from '../../core/material.module';
import { MockDataService } from '../../core/services/mock-data.service';

type AttendanceRow = {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
};

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './attendance.html',
  styleUrls: ['../fees/fees.scss', './attendance.scss']
})
export class AttendanceComponent implements AfterViewInit {
      loading = false;
    bulkMark(status: 'present' | 'absent' | 'late' | 'excused') {
      this.filteredStudents.forEach(student => {
        this.mock.setAttendance(student.id, this.selectedDate, status);
      });
      this.attendance = this.mock.getAttendance();
      this.updateFilteredStudents();
      this.updatePaginatedStudents();
      this.loadRows();
      this.openSnack(`All students marked ${status}.`);
    }
  paginatedStudents: any[] = [];
  pageIndex = 0;
  pageSize = 10;

  displayedColumns = ['studentName', 'className', 'date', 'status', 'actions'];
  dataSource = new MatTableDataSource<AttendanceRow>([]);

  students: any[] = [];
  attendance: any[] = [];
  rows: AttendanceRow[] = [];
  filtered: AttendanceRow[] = [];

  metrics = { total: 0, present: 0, absent: 0 };

  search = '';
  statusFilter: 'all' | 'present' | 'absent' | 'late' | 'excused' = 'all';
  selectedDate: string = new Date().toISOString().slice(0, 10);
  classFilter = '';

  classOptions: string[] = [];
  statusChips = ['present', 'absent', 'late', 'excused'];

  newEntry = {
    studentId: null as number | null,
    status: 'present' as 'present' | 'absent' | 'late' | 'excused',
    date: this.selectedDate
  };

  filteredStudents: any[] = [];

  ngOnInit() {
    this.loadRows();
    this.updateFilteredStudents();
    this.updatePaginatedStudents();
  }

  updateFilteredStudents() {
    const hasClass = !!(this.classFilter && this.classFilter !== 'All');
    const studentsToMap = hasClass ? this.students.filter(s => s.class === this.classFilter) : this.students;
    this.filteredStudents = studentsToMap.map(s => {
      const record = this.attendance.find(r => r.studentId === s.id && r.date === this.selectedDate);
      return { ...s, present: record ? record.status === 'present' : true };
    });
    this.resetPaginator();
  }

  updatePaginatedStudents() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedStudents = this.filteredStudents.slice(start, end);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedStudents();
  }

  getAttendanceStatus(studentId: number): string {
    const record = this.attendance.find(r => r.studentId === studentId && r.date === this.selectedDate);
    return record ? record.status : 'absent';
  }

  markAttendance(student: any) {
    // Toggle present/absent on click
    const status = student.present ? 'absent' : 'present';
    this.mock.setAttendance(student.id, this.selectedDate, status);
    this.attendance = this.mock.getAttendance();
    this.updateFilteredStudents();
    this.updatePaginatedStudents();
    this.loadRows();
    this.openSnack(`Attendance marked as ${status} for ${student.firstName} ${student.lastName}`);
  }

  toggleFromControl(event: Event, student: any) {
    event.stopPropagation();
    this.markAttendance(student);
  }

  markAll(present: boolean) {
    if (!this.classFilter) return;
    this.filteredStudents.forEach(student => {
      this.mock.setAttendance(student.id, this.selectedDate, present ? 'present' : 'absent');
    });
    this.attendance = this.mock.getAttendance();
    this.updateFilteredStudents();
    this.loadRows();
    this.openSnack(`All students marked as ${present ? 'present' : 'absent'}.`);
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private mock: MockDataService, private snackBar: MatSnackBar) {
    this.students = this.mock.getStudents() || [];
    this.attendance = this.mock.getAttendance() || [];
    this.classOptions = Array.from(new Set(this.students.map(s => s.class).filter(Boolean))) as string[];
    if (this.students.length) this.newEntry.studentId = this.students[0].id;
    this.loadRows();
    this.updateFilteredStudents();
    this.updatePaginatedStudents();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.updatePaginatedStudents();
  }

  private buildRow(student: any): AttendanceRow {
    const record = this.attendance.find(r => r.studentId === student.id && r.date === this.selectedDate);
    return {
      id: record ? record.id : 0,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      className: student.class || '--',
      date: record?.date || this.selectedDate,
      status: (record?.status as AttendanceRow['status']) || 'present'
    };
  }

  private resetPaginator() {
    this.pageIndex = 0;
    this.updatePaginatedStudents();
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  private loadRows() {
    const targetStudents = this.classFilter
      ? this.students.filter(s => s.class === this.classFilter)
      : this.students;
    this.rows = targetStudents.map(student => this.buildRow(student));
    this.applyFilters();
    this.refreshMetrics();
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    this.filtered = this.rows.filter(r => {
      const matchesTerm = !term || r.studentName.toLowerCase().includes(term) || String(r.studentId).includes(term);
      const matchesStatus = this.statusFilter === 'all' || r.status === this.statusFilter;
      const matchesDate = !this.selectedDate || r.date === this.selectedDate;
      const matchesClass = !this.classFilter || r.className === this.classFilter;
      return matchesTerm && matchesStatus && matchesDate && matchesClass;
    });
    this.dataSource.data = this.filtered;
  }

  clearSearch() { this.search = ''; this.applyFilters(); }
  onStatusChange(event: any) { this.statusFilter = event.value || 'all'; this.applyFilters(); }
  // Update filtered students when class changes
  onClassChange(value: string) {
    this.classFilter = value || '';
    this.loadRows();
    this.updateFilteredStudents();
  }
  onDateChange(value: string) {
    this.selectedDate = value;
    this.loadRows();
    this.updateFilteredStudents();
  }

  refreshMetrics() {
    this.metrics.total = this.rows.length;
    this.metrics.present = this.rows.filter(r => r.status === 'present').length;
    this.metrics.absent = this.rows.filter(r => r.status === 'absent').length;
  }

  addEntry() {
    if (!this.newEntry.studentId) return;
    this.mock.addAttendance(this.newEntry.studentId, this.newEntry.date, this.newEntry.status);
    this.attendance = this.mock.getAttendance();
    this.loadRows();
    const student = this.students.find(s => s.id === this.newEntry.studentId);
    const name = student ? `${student.firstName} ${student.lastName}` : 'student';
    this.openSnack(`Attendance entry added for ${name}.`);
  }

  editAttendance(row: AttendanceRow) {
    const next: AttendanceRow['status'] = row.status === 'present' ? 'absent' : 'present';
    this.mock.updateAttendanceStatus(row.id, next);
    this.attendance = this.mock.getAttendance();
    this.loadRows();
  }

  deleteAttendance(row: AttendanceRow) {
    this.attendance = this.attendance.filter(r => r.id !== row.id);
    this.loadRows();
  }

  private openSnack(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['attendance-snack']
    });
  }

  exportCsv() {
    const headers = ['Id', 'Student', 'Class', 'Date', 'Status'];
    const lines = this.filtered.map(r => [
      r.id,
      `"${(r.studentName || '').replace(/"/g, '""')}"`,
      r.className,
      r.date,
      r.status
    ].join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
