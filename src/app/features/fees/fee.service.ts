import { Injectable } from '@angular/core';
import { MockDataService } from '../../core/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class FeeService {
  constructor(private mock: MockDataService) {}

  // Simple adapter methods that the UI can call. These delegate to MockDataService for now.
  getFeeCategories() {
    // fee categories not yet modelled, return example list
    return [
      { id: 'tuition', name: 'Tuition', description: 'Annual tuition fee', type: 'Annual', status: 'active' },
      { id: 'transport', name: 'Transport', description: 'Bus facility fee', type: 'Monthly', status: 'active' }
    ];
  }

  getClassFeeStructure(classId: string) {
    // return a sample structure
    return [
      { head: 'Tuition', amount: 20000, frequency: 'Annual', optional: false },
      { head: 'Books', amount: 2500, frequency: 'Annual', optional: false },
      { head: 'Transport', amount: 1000, frequency: 'Monthly', optional: true }
    ];
  }

  // Adapter for student outstanding and history using MockDataService
  getStudentFees(studentId: number) {
    const fees = this.mock.getFees() as any[];
    const outstanding = fees.find(f => f.studentId === studentId) || { studentId, balance: 0, lastPaid: null };
    const history = [
      { date: '2025-08-05', receipt: 'R-001', mode: 'Cash', amount: 12700 },
      { date: '2025-04-10', receipt: 'R-002', mode: 'Online', amount: 15000 }
    ];
    return { outstanding, history };
  }

  // Expose mock helpers for UI use (delegates)
  getStudents() {
    return this.mock.getStudents();
  }

  getFees() {
    return this.mock.getFees();
  }

  collectFee(studentId: number, payments: { head: string; amount: number }[], method: string) {
    // For mock: sum amounts and call mock.payFee to reduce balance
    const sum = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const today = new Date().toISOString().slice(0,10);
    return this.mock.payFee(studentId, sum, today);
  }
}
