import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config'; // centralized base URL

/**
 * AuthService - handles authentication logic on the frontend.
 * Responsibilities:
 * - login/register requests
 * - saving and retrieving JWT token
 * - fetching current user profile
 * - checking authentication state
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${API_BASE_URL}/auth`;
  private tokenKey = 'access_token'; // key used in localStorage
  public currentUser: any = null;    // cached user profile

  constructor(private http: HttpClient) { }

  /** Login user and return observable with token */
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  /** Register new user */
  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { name, email, password });
  }

  /** Fetch current user profile */
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  /** Save token to localStorage */
  saveSession(res: any): void {
    if (res?.access_token) {
      localStorage.setItem(this.tokenKey, res.access_token);
    }
  }

  /** Logout and clear token */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUser = null;
  }

  /** Get token from localStorage */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Check if user is authenticated */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && token.trim().length > 0;
  }
}