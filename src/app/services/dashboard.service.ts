import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, retry, throwError } from 'rxjs';

export interface UserStats {
  userType: string;
  userCount: number;
  cumulativeCount: number;
}

export interface KycSummary {
  kycType: string;
  incomplete: number;
  inReview: number;
  verifiedLevel1: number;
  verifiedLevel2: number;
  approved: number;
  rejected: number;
}

export interface TransactionStatus {
  month: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
}

export interface TransactionAmount {
  month: number;
  noOfTxn: number;
  totalAmount: number;
}

export interface Balances {
  awccInventoryBalance: number;
  activeServiceBalance: number;
  eMoneyBalance: number;
  largeTransactionCount: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<UserStats[]> {
    return this.fetch<UserStats[]>('/data/users.json');
  }

  getKyc(): Observable<KycSummary[]> {
    return this.fetch<KycSummary[]>('/data/kyc.json');
  }

  getTransactions(): Observable<TransactionStatus[]> {
    return this.fetch<TransactionStatus[]>('/data/transactions.json');
  }

  getTransactionAmounts(): Observable<TransactionAmount[]> {
    return this.fetch<TransactionAmount[]>('/data/transaction-amounts.json');
  }

  getBalances(): Observable<Balances> {
    return this.fetch<Balances>('/data/balances.json');
  }

  private fetch<T>(url: string): Observable<T> {
    return this.http.get<{ data: T }>(url).pipe(
      map(r => r.data),
      retry({ count: 1, delay: 1000 }),
      catchError(err => throwError(() => new Error(`Failed to load ${url}: ${err.message}`)))
    );
  }
}
