import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { formatDateToApi, parseApiDate } from '../shared/date.utils';
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
  // backend may return ISO string or Date; allow both
  deadline: string | Date;
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
  status: string;
  deadline: string;
  userId: number;
  categoryId?: number | null;
}


@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private readonly apiUrl = `${API_BASE_URL}/tasks`;

  constructor(private http: HttpClient) { }

  getTasks(userId?: number): Observable<Task[]> {
    const params = userId ? new HttpParams().set('userId', String(userId)) : undefined;
    return this.http
      .get<Task[]>(this.apiUrl, { params })
      .pipe(map((tasks) => tasks.map((task) => this.normalizeTask(task))));
  }

  getTask(id: number): Observable<Task> {
    return this.http
      .get<Task>(`${this.apiUrl}/${id}`)
      .pipe(map((task) => this.normalizeTask(task)));
  }

  createTask(task: TaskPayload): Observable<Task> {
    return this.http
      .post<Task>(this.apiUrl, task)
      .pipe(map((createdTask) => this.normalizeTask(createdTask)));
  }

  updateTask(id: number, task: TaskPayload): Observable<Task> {
    return this.http
      .put<Task>(`${this.apiUrl}/${id}`, task)
      .pipe(map((updatedTask) => this.normalizeTask(updatedTask)));
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toPayload(task: Omit<TaskPayload, 'deadline'> & { deadline: Date }): TaskPayload {
    return {
      ...task,
      deadline: formatDateToApi(task.deadline),
    };
  }

  private normalizeTask(task: Task): Task {
    return {
      ...task,
      deadline: parseApiDate(task.deadline),
    };
  }
}
