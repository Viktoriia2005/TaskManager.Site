import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    roleId: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; // бекенд Nest.js

  private readonly tokenKey = 'token';
  private readonly userKey = 'currentUser';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  register(name: string, email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, {
      name,
      email,
      password,
    });
  }

  saveSession(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.access_token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): LoginResponse['user'] | null {
    const rawUser = localStorage.getItem(this.userKey);
    return rawUser ? JSON.parse(rawUser) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }
}
