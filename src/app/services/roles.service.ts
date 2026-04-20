import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

/**
 * RolesService
 * Handles users and roles admin operations
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private usersUrl = `${API_BASE_URL}/users`;

  constructor(private http: HttpClient) { }

  /** Attach JWT token */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  /** Get all users */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersUrl}/all`, {
      headers: this.getAuthHeaders()
    });
  }

  /** Update user role */
  updateUserRole(userId: number, roleId: number): Observable<User> {
    return this.http.patch<User>(
      `${this.usersUrl}/${userId}/role`,
      { roleId },
      { headers: this.getAuthHeaders() }
    );
  }

  /** Delete user */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.usersUrl}/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }
}