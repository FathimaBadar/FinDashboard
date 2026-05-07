import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { API_BASE_URL } from '../core/tokens/api.token';
import { UserStats } from '../core/models/user-stats.model';
import { KycSummary } from '../core/models/kyc-summary.model';
import { TransactionStatus } from '../core/models/transaction-status.model';
import { TransactionAmount } from '../core/models/transaction-amount.model';
import { Balances } from '../core/models/balances.model';

export type { UserStats, KycSummary, TransactionStatus, TransactionAmount, Balances };

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  getUsers(): Observable<UserStats[]> {
    return this.get<UserStats[]>('users');
  }

  getKyc(): Observable<KycSummary[]> {
    return this.get<KycSummary[]>('kyc');
  }

  getTransactions(): Observable<TransactionStatus[]> {
    return this.get<TransactionStatus[]>('transactions');
  }

  getTransactionAmounts(): Observable<TransactionAmount[]> {
    return this.get<TransactionAmount[]>('transaction-amounts');
  }

  getBalances(): Observable<Balances> {
    return this.get<Balances>('balances');
  }

  private get<T>(resource: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${resource}`).pipe(
      retry({ count: 1, delay: 1000 }),
      catchError(err => throwError(() => new Error(`Failed to load ${resource}: ${err.message}`)))
    );
  }
}
