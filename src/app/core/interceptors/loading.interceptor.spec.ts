import { TestBed } from '@angular/core/testing';
import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../loading.service';

describe('loadingInterceptor', () => {
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    loadingService = TestBed.inject(LoadingService);
  });

  function fakeHandler(): { next: HttpHandlerFn; response$: Subject<HttpEvent<unknown>> } {
    const response$ = new Subject<HttpEvent<unknown>>();
    return { next: () => response$.asObservable(), response$ };
  }

  it('sets isLoading true while the request is pending, and false once it completes', () => {
    const req = new HttpRequest('GET', '/test');
    const { next, response$ } = fakeHandler();

    expect(loadingService.isLoading()).toBe(false);

    let completed = false;
    TestBed.runInInjectionContext(() => {
      loadingInterceptor(req, next).subscribe({ complete: () => (completed = true) });
    });

    // The response hasn't arrived yet — the interceptor must already show loading.
    expect(loadingService.isLoading()).toBe(true);
    expect(completed).toBe(false);

    response$.next(new HttpResponse({ status: 200 }));
    response$.complete();

    expect(completed).toBe(true);
    expect(loadingService.isLoading()).toBe(false);
  });

  it('stops loading even when the request errors', () => {
    const req = new HttpRequest('GET', '/test');
    const { next, response$ } = fakeHandler();

    let error: unknown;
    TestBed.runInInjectionContext(() => {
      loadingInterceptor(req, next).subscribe({ error: err => (error = err) });
    });

    expect(loadingService.isLoading()).toBe(true);

    response$.error(new Error('network failure'));

    expect(error).toBeInstanceOf(Error);
    // finalize() runs on error too — the spinner must not get stuck on.
    expect(loadingService.isLoading()).toBe(false);
  });

  it('keeps isLoading true while a second, concurrent request is still pending', () => {
    const req = new HttpRequest('GET', '/test');
    const first = fakeHandler();
    const second = fakeHandler();

    TestBed.runInInjectionContext(() => {
      loadingInterceptor(req, first.next).subscribe();
      loadingInterceptor(req, second.next).subscribe();
    });

    expect(loadingService.isLoading()).toBe(true);

    first.response$.next(new HttpResponse({ status: 200 }));
    first.response$.complete();

    // The second request is still in flight — the counter must not have hit zero yet.
    expect(loadingService.isLoading()).toBe(true);

    second.response$.next(new HttpResponse({ status: 200 }));
    second.response$.complete();

    expect(loadingService.isLoading()).toBe(false);
  });
});
