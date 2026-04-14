import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  role?: Role;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private apiUrl = 'http://localhost:3000/roles';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // або отримати з AuthService
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  /** Отримати всіх користувачів */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/all`, {
      headers: this.getAuthHeaders()
    });
  }

  /** Оновити роль користувача */
  updateUserRole(userId: number, roleId: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}/role`, { roleId }, {
      headers: this.getAuthHeaders()
    });
  }

  /** Видалити користувача */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
