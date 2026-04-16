import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { AuthService } from '../../../services/auth.service';
import { CategoriesService, Category } from '../../../services/categories.service';
import { Task, TaskPayload, TasksService } from '../../../services/tasks.service';

@Component({
  selector: 'app-user-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './user-task-form.component.html',
  styleUrl: './user-task-form.component.scss'
})
export class UserTaskFormComponent implements OnInit {
  // Task ID (null if creating a new task)
  taskId: number | null = null;

  // Current logged-in user
  currentUser: ReturnType<AuthService['getCurrentUser']> = null;

  // Tasks for header dropdown
  headerTasks: { id: number; title: string }[] = [];

  // Available categories
  categories: Category[] = [];

  // Priority and status options
  priorities = ['low', 'medium', 'high'];
  statuses = ['new', 'in_progress', 'done'];

  // Local task object bound to form inputs
  task = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'new',
    deadline: '',
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
    // Get current user from AuthService
    this.currentUser = this.authService.getCurrentUser();

    // Check if editing an existing task (id in route params)
    const id = this.route.snapshot.paramMap.get('id');
    this.taskId = id ? Number(id) : null;

    // Load tasks for header menu
    if (this.currentUser) {
      this.tasksService.getTasks(this.currentUser.id).subscribe((tasks) => {
        this.headerTasks = tasks.map(({ id: taskId, title }) => ({ id: taskId, title }));
      });
    }

    // Load categories for dropdown
    this.categoriesService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });

    // If editing, load task data into form
    if (this.taskId) {
      this.tasksService.getTask(this.taskId).subscribe((task) => {
        this.patchTask(task);
      });
    }
  }

  saveTask(): void {
    // Redirect to auth if user is not logged in
    if (!this.currentUser) {
      this.router.navigate(['/auth']);
      return;
    }

    // Build payload for backend
    const payload: TaskPayload = {
      title: this.task.title.trim(),
      description: this.task.description || '',
      priority: this.task.priority, // keep original casing
      status: this.task.status,     // keep original casing
      deadline: this.task.deadline
        ? new Date(this.task.deadline + 'T00:00:00Z') // ✅ ensure full ISO format
        : new Date(),
      userId: Number(this.currentUser.id),
      categoryId: this.task.categoryId ?? null,
    };

    // Decide whether to create or update
    const request = this.taskId
      ? this.tasksService.updateTask(this.taskId, payload)
      : this.tasksService.createTask(payload);

    // After success, redirect to tasks list
    request.subscribe(() => {
      this.router.navigate(['/user/tasks']);
    });
  }

  cancel(): void {
    // Navigate back to tasks list
    this.router.navigate(['/user/tasks']);
  }

  logout(): void {
    // Clear session and redirect to auth
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  private patchTask(task: Task): void {
    // Fill form with existing task data
    this.task = {
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      status: task.status,
      deadline: task.deadline ? String(task.deadline).slice(0, 10) : '',
      categoryId: task.categoryId ?? task.category?.id ?? null,
    };
  }
}