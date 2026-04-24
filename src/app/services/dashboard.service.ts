import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

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
  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserStats[]> {
    return this.http.get<any>('/data/users.json').pipe(map(r => r.data));
  }

  getKyc(): Observable<KycSummary[]> {
    return this.http.get<any>('/data/kyc.json').pipe(map(r => r.data));
  }

  getTransactions(): Observable<TransactionStatus[]> {
    return this.http.get<any>('/data/transactions.json').pipe(map(r => r.data));
  }

  getTransactionAmounts(): Observable<TransactionAmount[]> {
    return this.http.get<any>('/data/transaction-amounts.json').pipe(map(r => r.data));
  }

  getBalances(): Observable<Balances> {
    return this.http.get<any>('/data/balances.json').pipe(map(r => r.data));
  }
}
