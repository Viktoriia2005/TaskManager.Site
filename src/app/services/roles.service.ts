import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private apiUrl = 'http://localhost:3000/roles'; // бекенд Nest.js

  constructor(private http: HttpClient) { }

  /**
   * Отримати всіх користувачів для управління їх ролями
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/all`);
  }

  /**
   * Оновити роль користувача
   */
  updateUserRole(userId: number, roleId: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}`, { roleId });
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getRole(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  updateRole(id: number, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
