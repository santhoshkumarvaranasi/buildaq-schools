export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  date: string; // ISO date string
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}
