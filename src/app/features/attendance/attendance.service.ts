import { Injectable } from '@angular/core';

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
    getRecordsForClass(classId: number, date: string): AttendanceRecord[] {
      return this.records.filter(r => r.classId === classId && r.date === date);
    }
  private records: AttendanceRecord[] = [];

  getAttendanceRecords(): AttendanceRecord[] {
    return [...this.records];
  }

  addRecord(record: AttendanceRecord) {
    this.records.unshift({ ...record, id: Date.now() });
  }

  updateRecord(id: number, update: Partial<AttendanceRecord>) {
    const idx = this.records.findIndex(r => r.id === id);
    if (idx > -1) {
      this.records[idx] = { ...this.records[idx], ...update };
    }
  }

  deleteRecord(id: number) {
    const idx = this.records.findIndex(r => r.id === id);
    if (idx > -1) {
      this.records.splice(idx, 1);
    }
  }
}
