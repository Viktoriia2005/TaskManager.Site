import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../services/auth.service';
import { CategoriesService, Category } from '../../services/categories.service';
import { Task, TaskPayload, TasksService } from '../../services/tasks.service';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskId: number | null = null;
  currentUser: any = null; // English: will be set after fetching profile
  headerTasks: { id: number; title: string }[] = [];
  categories: Category[] = [];

  priorities = ['Low', 'Medium', 'High'];
  statuses = ['new', 'in progress', 'done'];

  task = {
    title: '',
    description: '',
    priority: 'Medium',
    status: 'new',
    deadline: new Date(), // always Date
    categoryId: null as number | null,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private categoriesService: CategoriesService,
    private tasksService: TasksService,
  ) { }

  ngOnInit(): void {
    // English: fetch current user profile
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;

        // English: load tasks for header once user is available
        this.tasksService.getTasks(this.currentUser.id).subscribe((tasks) => {
          this.headerTasks = tasks.map(({ id: taskId, title }) => ({ id: taskId, title }));
        });
      },
      error: (err) => {
        console.error('Failed to load current user:', err);
        this.currentUser = null;
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    this.taskId = id ? Number(id) : null;

    this.categoriesService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });

    if (this.taskId) {
      this.tasksService.getTask(this.taskId).subscribe((task) => {
        this.patchTask(task);
      });
    }
  }

  /** Save task (create or update) */
  saveTask(): void {
    if (!this.currentUser) {
      this.router.navigate(['/auth']);
      return;
    }

    const deadlineValue: Date = this.task.deadline instanceof Date ? this.task.deadline : new Date(this.task.deadline);

    const payload: TaskPayload = {
      title: this.task.title,
      description: this.task.description || '',
      priority: this.task.priority,
      status: this.task.status,
      deadline: deadlineValue, // always Date
      userId: this.currentUser.id,
      categoryId: this.task.categoryId,
    };

    const request = this.taskId
      ? this.tasksService.updateTask(this.taskId, payload)
      : this.tasksService.createTask(payload);

    request.subscribe(() => {
      this.router.navigate(['/tasks']);
    });
  }

  /** Cancel and go back to tasks */
  cancel(): void {
    this.router.navigate(['/tasks']);
  }

  /** Logout and redirect to auth */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  /** Patch task data into form */
  private patchTask(task: Task): void {
    let normalizedDeadline: Date = new Date();
    if (task.deadline) {
      normalizedDeadline = task.deadline instanceof Date ? task.deadline : new Date(task.deadline);
      if (isNaN(normalizedDeadline.getTime())) {
        normalizedDeadline = new Date();
      }
    }
    this.task = {
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      status: task.status,
      deadline: normalizedDeadline,
      categoryId: task.categoryId ?? task.category?.id ?? null,
    };
  }
}