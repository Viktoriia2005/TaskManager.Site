import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  role?: {
    id: number;
    name: string;
  };
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${API_BASE_URL}/users`; // Nest.js backend

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  changePassword(id: number, payload: ChangePasswordPayload): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/password`, payload);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateLanguage(userId: number, language: 'uk' | 'en') {
    return this.http.patch<void>(`${this.apiUrl}/${userId}/language`, {
      language,
    });
  }
}
