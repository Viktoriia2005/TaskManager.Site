import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { routes } from './app.routes';
import { AuthInterceptor } from './services/auth.interceptor';
import { appDateProviders } from './shared/app-date-adapter';

/**
 * Application configuration for standalone bootstrap with classic interceptor.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(routes, withHashLocation()),

    provideHttpClient(withInterceptorsFromDi()),

    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MAT_DATE_LOCALE, useValue: 'uk-UA' },
    ...appDateProviders,
  ],
};
