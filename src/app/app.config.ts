import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { routes } from './app.routes';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { API_BASE_URL } from './core/tokens/api.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([loadingInterceptor])),
    provideCharts(withDefaultRegisterables()),
    { provide: API_BASE_URL, useValue: 'http://localhost:3000' }
  ]
};
