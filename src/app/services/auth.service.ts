import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface AuthResponse {
  access_token: string;
}

export interface CurrentUser {
  userId?: number;
  id: number;
  name: string;
  email: string;
  roleId: number;
  language?: 'uk' | 'en';
}

export interface ProfileResponse {
  message: string;
  user: CurrentUser;
}

/**
 * Stable AuthService (works with login/logout/navigation)
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${API_BASE_URL}/auth`;
  private readonly tokenKey = 'access_token';

  constructor(private http: HttpClient) { }

  private ensureApiConfigured(): Observable<never> {
    return throwError(() => new Error('API_BASE_URL is not configured'));
  }

  /** LOGIN */
  login(email: string, password: string): Observable<AuthResponse> {
    if (!API_BASE_URL) {
      return this.ensureApiConfigured();
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password });
  }

  /** REGISTER */
  register(name: string, email: string, password: string): Observable<AuthResponse> {
    if (!API_BASE_URL) {
      return this.ensureApiConfigured();
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password });
  }

  /** SAVE TOKEN (IMPORTANT) */
  saveSession(res: AuthResponse): void {
    if (res?.access_token) {
      localStorage.setItem(this.tokenKey, res.access_token);
    }
  }

  /** GET TOKEN */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** LOGOUT */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  /** CHECK AUTH */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** GET CURRENT USER (FIXED) */
  getCurrentUser(): Observable<ProfileResponse> {
    if (!API_BASE_URL) {
      return this.ensureApiConfigured();
    }

    const token = this.getToken();

    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    });
  }
}
