import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService, ApiResponse } from '../core/services/api.service';
import { TenantService } from '../core/services/tenant.service';

export interface RemoteStudent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  class: string;
  enrollmentDate: string | Date;
  status: 'active' | 'inactive' | 'transferred';
}

@Injectable({ providedIn: 'root' })
export class SchoolsService {
  constructor(private api: ApiService, private tenant: TenantService) {}

  /**
   * Fetch students for the current tenant. The API expects tenant context
   * either via the `X-Tenant-ID` header (ApiService already sets this) or
   * via an explicit query param. We include both to be explicit in dev.
   */
  getStudents(): Observable<RemoteStudent[]> {
    const tenantId = this.tenant.getTenantId();
    const params = { tenantId };
    return this.api.get<RemoteStudent[]>('schools/students', params).pipe(
      map((resp: ApiResponse<RemoteStudent[]>) => {
        return resp?.data || [];
      }),
      catchError((err) => {
        console.error('Failed to load students from API', err);
        return of([]);
      })
    );
  }
}
