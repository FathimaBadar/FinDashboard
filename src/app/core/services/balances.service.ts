import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.token';
import { Balances } from '../models/balances.model';

@Injectable({ providedIn: 'root' })
export class BalancesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/balances`;

  get(): Observable<Balances> {
    return this.http.get<Balances>(this.baseUrl).pipe(
      retry({ count: 1, delay: 1000 }),
      catchError(err => throwError(() => new Error(`Failed to load balances: ${err.message}`)))
    );
  }
}
