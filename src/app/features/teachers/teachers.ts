import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, MockStaff } from '../../core/services/mock-data.service';

interface TeacherRow {
  id: number;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  classes?: string;
  status?: string;
}

@Component({
  selector: 'app-teachers',
  standalone: true,
  templateUrl: './teachers.html',
  styleUrls: ['../../features/fees/fees.scss','./teachers.scss'],
  imports: [CommonModule, FormsModule, MaterialModule]
})
export class TeachersComponent implements AfterViewInit {
  rows: TeacherRow[] = [];
  dataSource = new MatTableDataSource<TeacherRow>([]);
  displayedColumns = ['name','role','classes','email','phone','status','actions'];
  search = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  metrics = { total: 0, active: 0 };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private mock: MockDataService) {
    this.loadRows();
  }

  ngAfterViewInit() {
    this.attachTableHelpers();
  }

  loadRows() {
    const staff = (this.mock.getStaff() || []) as MockStaff[];
    this.rows = staff.map(s => ({
      id: s.id,
      name: s.name,
      role: s.role,
      email: s.email,
      phone: s.phone,
      classes: '',
      status: Math.random() < 0.7 ? 'active' : 'inactive' // 70% active, 30% inactive
    }));
    this.refreshMetrics();
    this.applyFilters();
  }

  refreshMetrics() {
    this.metrics.total = this.rows.length;
    this.metrics.active = this.rows.length;
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    const filtered = this.rows.filter(r => {
      const matchesTerm = !term || r.name.toLowerCase().includes(term) || String(r.id).includes(term);
      const matchesStatus = this.statusFilter === 'all' || (r.status || '').toLowerCase() === this.statusFilter;
      return matchesTerm && matchesStatus;
    });
    this.dataSource.data = filtered;
    this.attachTableHelpers();
  }

  attachTableHelpers() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.paginator.firstPage();
    }
    if (this.sort) this.dataSource.sort = this.sort;
  }

  clearSearch() {
    this.search = '';
    this.applyFilters();
  }

  onStatusChange(event: any) {
    const val = event && 'value' in event ? event.value : null;
    this.statusFilter = val || 'all';
    this.applyFilters();
  }

  addTeacher() {
    alert('Implement add teacher flow');
  }

  editTeacher(row: TeacherRow) { alert(`Edit ${row.name}`); }
  deleteTeacher(row: TeacherRow) { if (confirm('Delete this teacher?')) { /* mock remove */ alert('Deleted (mock)'); } }

  exportCsv() {
    const headers = ['Id','Name','Role','Classes','Email','Phone','Status'];
    const lines = this.dataSource.data.map(r => [
      r.id,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      r.role || '',
      r.classes || '',
      r.email || '',
      r.phone || '',
      r.status || ''
    ].join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teachers.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
