import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.token';
import { TransactionStatus } from '../models/transaction-status.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/transactions`;

  getAll(): Observable<TransactionStatus[]> {
    return this.http.get<TransactionStatus[]>(this.baseUrl).pipe(
      retry({ count: 1, delay: 1000 }),
      catchError(err => throwError(() => new Error(`Failed to load transactions: ${err.message}`)))
    );
  }

  getById(id: number): Observable<TransactionStatus> {
    return this.http.get<TransactionStatus>(`${this.baseUrl}/${id}`);
  }

  create(transaction: Omit<TransactionStatus, 'id'>): Observable<TransactionStatus> {
    return this.http.post<TransactionStatus>(this.baseUrl, transaction);
  }

  update(id: number, changes: Partial<TransactionStatus>): Observable<TransactionStatus> {
    return this.http.patch<TransactionStatus>(`${this.baseUrl}/${id}`, changes);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
