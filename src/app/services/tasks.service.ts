import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaskCategory {
  id: number;
  name: string;
}

export interface TaskUser {
  id: number;
  name: string;
  email: string;
  roleId: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: string;
  deadline: string;
  status: string;
  userId: number;
  categoryId?: number | null;
  user?: TaskUser;
  category?: TaskCategory | null;
}

export interface TaskPayload {
  title: string;
  description?: string;
  priority: string;
  deadline: string;
  status: string;
  userId: number;
  categoryId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private readonly apiUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) { }

  getTasks(userId?: number): Observable<Task[]> {
    const params = userId ? new HttpParams().set('userId', userId) : undefined;
    return this.http.get<Task[]>(this.apiUrl, { params });
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: TaskPayload): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: TaskPayload): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
