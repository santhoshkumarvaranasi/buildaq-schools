import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from '../../core/material.module';
import { MockDataService, MockStudent } from '../../core/services/mock-data.service';
import { TenantService } from '../../core/services/tenant.service';

interface StudentRow {
  id: number;
  name: string;
  rollNo?: string;
  class?: string;
  section?: string;
  status?: string;
  email?: string;
  enrollmentDate?: string;
}

@Component({
  selector: 'app-students',
  standalone: true,
  templateUrl: './students.html',
  styleUrls: ['../../features/fees/fees.scss','./students.scss'],
  imports: [CommonModule, FormsModule, MaterialModule]
})
export class StudentsComponent implements AfterViewInit {
  rows: StudentRow[] = [];
  dataSource = new MatTableDataSource<StudentRow>([]);
  displayedColumns = ['name','class','section','rollNo','status','email','enrolled','actions'];
  classes: string[] = [];
  search = '';
  classFilter = '';
  statusFilter: 'all' | 'active' | 'inactive' | 'transferred' = 'all';
  metrics = { total: 0, active: 0, inactive: 0 };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private mock: MockDataService, private tenantService: TenantService) {
    this.loadRows();
  }

  ngAfterViewInit() {
    this.attachTableHelpers();
  }

  loadRows() {
    const students = (this.mock.getStudents() || []) as MockStudent[];
    this.rows = students.map((s) => ({
      id: s.id,
      name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
      rollNo: s.rollNo || (s as any)['roll_number'] || '',
      class: s.class,
      section: s.section,
      status: s.status || 'active',
      email: s.email,
      enrollmentDate: s.enrollmentDate
    }));
    this.classes = Array.from(new Set(this.rows.map(r => r.class).filter(Boolean))) as string[];
    this.refreshMetrics();
    this.applyFilters();
  }

  refreshMetrics() {
    this.metrics.total = this.rows.length;
    this.metrics.active = this.rows.filter(r => (r.status || '').toLowerCase() === 'active').length;
    this.metrics.inactive = this.rows.length - this.metrics.active;
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    const filtered = this.rows.filter(r => {
      const matchesTerm = !term || r.name.toLowerCase().includes(term) || String(r.id).includes(term) || (r.rollNo || '').toLowerCase().includes(term);
      const matchesClass = !this.classFilter || r.class === this.classFilter;
      const matchesStatus = this.statusFilter === 'all' || (r.status || '').toLowerCase() === this.statusFilter;
      return matchesTerm && matchesClass && matchesStatus;
    });
    this.dataSource.data = filtered;
    this.attachTableHelpers();
  }

  attachTableHelpers() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.paginator.firstPage();
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  clearSearch() {
    this.search = '';
    this.applyFilters();
  }

  onStatusChange(event: any) {
    const value = event && 'value' in event ? event.value : null;
    this.statusFilter = value || 'all';
    this.applyFilters();
  }

  addStudent() {
    // hook into existing add form if needed
    alert('Implement add student flow');
  }

  editStudent(row: StudentRow) {
    alert(`Edit student ${row.name}`);
  }

  deleteStudent(row: StudentRow) {
    if (!confirm('Delete this student?')) return;
    this.mock.deleteStudent(row.id);
    this.loadRows();
  }
}
