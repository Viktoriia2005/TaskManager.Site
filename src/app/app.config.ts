import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from './services/auth.interceptor';

/**
 * Application configuration for standalone bootstrap with classic interceptor.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Enable Angular zone change detection optimization
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Provide router with application routes
    provideRouter(routes),

    // Provide HttpClient
    provideHttpClient(),

    // Register classic interceptor
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
};