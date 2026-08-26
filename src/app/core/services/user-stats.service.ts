import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.token';
import { UserStats } from '../models/user-stats.model';

@Injectable({ providedIn: 'root' })
export class UserStatsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/users`;

  getAll(): Observable<UserStats[]> {
    return this.http.get<UserStats[]>(this.baseUrl).pipe(
      retry({ count: 1, delay: 1000 }),
      catchError(err => throwError(() => new Error(`Failed to load users: ${err.message}`)))
    );
  }
}
