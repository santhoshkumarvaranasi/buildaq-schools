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



      map((resp: any) => {
        // resp may be:
        // - ApiResponse { data: [...] }
        // - raw array [...]
        // - HttpResponse wrapping the above (ApiService may return full response as fallback)
        try {
          if (!resp) return [];
          if (Array.isArray(resp)) return resp as RemoteStudent[];
          if (resp.data && Array.isArray(resp.data)) return resp.data as RemoteStudent[];
          if ((resp as any).body && Array.isArray((resp as any).body)) return (resp as any).body as RemoteStudent[];
        } catch (e) {
          console.warn('Unexpected students response shape', resp, e);
        }
        return [];
      }),
      catchError((err) => {
        console.error('Failed to load students from API', err);
        return of([]);
      })
    );
  }

  /**
   * Create a new student for the current tenant
   */
  createStudent(student: Partial<RemoteStudent>): Observable<RemoteStudent> {
    const tenantId = this.tenant.getTenantId();
    const params = tenantId ? { tenantId } : undefined;
    return this.api.post<RemoteStudent>('schools/students', student).pipe(
      map((resp: any) => {
        if (!resp) throw new Error('Empty response from create student');
        if (resp.data !== undefined) return resp.data as RemoteStudent;
        // Fallback: if API returned the created entity directly
        return resp as RemoteStudent;
      })
    );
  }
}
