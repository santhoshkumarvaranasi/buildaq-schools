import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AttendanceRecord } from './attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private records: AttendanceRecord[] = [];
  private records$ = new BehaviorSubject<AttendanceRecord[]>([]);

  getAttendanceRecords() {
    return this.records$.asObservable();
  }

  addRecord(record: AttendanceRecord) {
    this.records.push(record);
    this.records$.next(this.records);
  }

  updateRecord(id: number, update: Partial<AttendanceRecord>) {
    const idx = this.records.findIndex(r => r.id === id);
    if (idx > -1) {
      this.records[idx] = { ...this.records[idx], ...update };
      this.records$.next(this.records);
    }
  }

  getRecordsForClass(classId: number, date: string) {
    return this.records.filter(r => r.classId === classId && r.date === date);
  }
}
