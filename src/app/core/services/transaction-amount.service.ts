import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.token';
import { TransactionAmount } from '../models/transaction-amount.model';

@Injectable({ providedIn: 'root' })
export class TransactionAmountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/transaction-amounts`;

  getAll(): Observable<TransactionAmount[]> {
    return this.http.get<TransactionAmount[]>(this.baseUrl).pipe(
      retry({ count: 1, delay: 1000 }),
      catchError(err => throwError(() => new Error(`Failed to load transaction amounts: ${err.message}`)))
    );
  }
}
