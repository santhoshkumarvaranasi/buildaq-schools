import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TenantService, Tenant } from '../core/services/tenant.service';

@Component({
  selector: 'app-schools-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './schools-dashboard.html',
  styleUrl: './schools-dashboard.scss'
})
export class SchoolsDashboardComponent implements OnInit {
  tenant: Tenant | null = null;

  constructor(private tenantService: TenantService) {}

  ngOnInit() {
    this.tenantService.currentTenant$.subscribe(tenant => {
      this.tenant = tenant;
    });
  }
}
