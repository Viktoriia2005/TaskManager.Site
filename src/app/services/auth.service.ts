import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

/**
 * Stable AuthService (works with login/logout/navigation)
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${API_BASE_URL}/auth`;
  private tokenKey = 'access_token';

  constructor(private http: HttpClient) { }

  /** LOGIN */
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  /** REGISTER */
  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { name, email, password });
  }

  /** SAVE TOKEN (IMPORTANT) */
  saveSession(res: any): void {
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
  getCurrentUser(): Observable<any> {
    const token = this.getToken();

    return this.http.get(`${this.apiUrl}/profile`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    });
  }
}