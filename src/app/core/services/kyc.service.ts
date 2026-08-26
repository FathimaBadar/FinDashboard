import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.token';
import { KycSummary } from '../models/kyc-summary.model';

@Injectable({ providedIn: 'root' })
export class KycService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/kyc`;

  getAll(): Observable<KycSummary[]> {
    return this.http.get<KycSummary[]>(this.baseUrl).pipe(
      retry({ count: 1, delay: 1000 }),
      catchError(err => throwError(() => new Error(`Failed to load KYC summary: ${err.message}`)))
    );
  }
}
