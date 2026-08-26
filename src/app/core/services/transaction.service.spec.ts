import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TransactionService } from './transaction.service';
import { API_BASE_URL } from '../tokens/api.token';
import { TransactionStatus } from '../models/transaction-status.model';

describe('TransactionService', () => {
  const baseUrl = 'http://test-api';
  let service: TransactionService;
  let httpMock: HttpTestingController;

  const sample: TransactionStatus = {
    id: 1,
    month: 1,
    successCount: 100,
    failedCount: 5,
    pendingCount: 2
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl }
      ]
    });
    service = TestBed.inject(TransactionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Fails the test if any request was made but never flushed/expected.
    httpMock.verify();
  });

  it('getAll() issues a GET to /transactions and returns the response body', () => {
    let result: TransactionStatus[] | undefined;
    service.getAll().subscribe(res => (result = res));

    const req = httpMock.expectOne(`${baseUrl}/transactions`);
    expect(req.request.method).toBe('GET');
    req.flush([sample]);

    expect(result).toEqual([sample]);
  });

  it('getById() issues a GET to /transactions/:id', () => {
    let result: TransactionStatus | undefined;
    service.getById(1).subscribe(res => (result = res));

    const req = httpMock.expectOne(`${baseUrl}/transactions/1`);
    expect(req.request.method).toBe('GET');
    req.flush(sample);

    expect(result).toEqual(sample);
  });

  it('create() issues a POST with the new record in the body', () => {
    const { id, ...payload } = sample;
    let result: TransactionStatus | undefined;
    service.create(payload).subscribe(res => (result = res));

    const req = httpMock.expectOne(`${baseUrl}/transactions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(sample);

    expect(result).toEqual(sample);
  });

  it('update() issues a PATCH to /transactions/:id with only the changed fields', () => {
    let result: TransactionStatus | undefined;
    service.update(1, { successCount: 150 }).subscribe(res => (result = res));

    const req = httpMock.expectOne(`${baseUrl}/transactions/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ successCount: 150 });
    req.flush({ ...sample, successCount: 150 });

    expect(result?.successCount).toBe(150);
  });

  it('remove() issues a DELETE to /transactions/:id', () => {
    let completed = false;
    service.remove(1).subscribe(() => (completed = true));

    const req = httpMock.expectOne(`${baseUrl}/transactions/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(completed).toBe(true);
  });

  it('getAll() retries once on failure before surfacing a wrapped error', async () => {
    vi.useFakeTimers();
    try {
      let error: Error | undefined;
      service.getAll().subscribe({ error: err => (error = err) });

      // First attempt fails.
      httpMock.expectOne(`${baseUrl}/transactions`).flush('boom', { status: 500, statusText: 'Server Error' });

      // retry({ count: 1, delay: 1000 }) waits 1s before the retried attempt.
      await vi.advanceTimersByTimeAsync(1000);

      // Retried attempt also fails — no more retries left.
      httpMock.expectOne(`${baseUrl}/transactions`).flush('boom', { status: 500, statusText: 'Server Error' });

      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toContain('Failed to load transactions');
    } finally {
      vi.useRealTimers();
    }
  });
});
