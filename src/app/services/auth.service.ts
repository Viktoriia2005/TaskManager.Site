import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  /** LOGIN */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password });
  }

  /** REGISTER */
  register(name: string, email: string, password: string): Observable<AuthResponse> {
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
    const token = this.getToken();

    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    });
  }
}
