import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * AuthInterceptor - attaches Authorization header with JWT token
 * to every outgoing HTTP request if token exists.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getToken();
        if (token) {
            // Clone request and add Authorization header
            const cloned = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
            });
            return next.handle(cloned);
        }
        // Pass request without modification if no token
        return next.handle(req);
    }
}