import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TenantService, Tenant } from '../core/services/tenant.service';
import { MaterialModule } from '../core/material.module';

@Component({
  selector: 'app-schools-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialModule],
  templateUrl: './schools-dashboard.html',
  styleUrl: './schools-dashboard.scss'
})
export class SchoolsDashboardComponent implements OnInit {
  tenant: Tenant | null = null;
  isShell = window.location.pathname.startsWith('/schools');

  constructor(private tenantService: TenantService) {}

  ngOnInit() {
    this.tenantService.currentTenant$.subscribe(tenant => {
      this.tenant = tenant;
    });
  }

  getLink(path: string) {
    return this.isShell ? `/schools/${path}` : `/${path}`;
  }
}
