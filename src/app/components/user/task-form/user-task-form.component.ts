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
  taskId: number | null = null;
  currentUser: ReturnType<AuthService['getCurrentUser']> = null;
  headerTasks: { id: number; title: string }[] = [];
  categories: Category[] = [];
  priorities = ['Low', 'Medium', 'High'];
  statuses = ['new', 'in progress', 'done'];
  task = {
    title: '',
    description: '',
    priority: 'Medium',
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
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const id = this.route.snapshot.paramMap.get('id');
    this.taskId = id ? Number(id) : null;

    if (this.currentUser) {
      this.tasksService.getTasks(this.currentUser.id).subscribe((tasks) => {
        this.headerTasks = tasks.map(({ id: taskId, title }) => ({ id: taskId, title }));
      });
    }

    this.categoriesService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });

    if (this.taskId) {
      this.tasksService.getTask(this.taskId).subscribe((task) => {
        this.patchTask(task);
      });
    }
  }

  saveTask(): void {
    if (!this.currentUser) {
      this.router.navigate(['/auth']);
      return;
    }

    const payload: TaskPayload = {
      title: this.task.title,
      description: this.task.description || '',
      priority: this.task.priority,
      status: this.task.status,
      deadline: this.task.deadline,
      userId: this.currentUser.id,
      categoryId: this.task.categoryId,
    };

    const request = this.taskId
      ? this.tasksService.updateTask(this.taskId, payload)
      : this.tasksService.createTask(payload);

    request.subscribe(() => {
      this.router.navigate(['/user/tasks']);
    });
  }

  cancel(): void {
    this.router.navigate(['/user/tasks']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  private patchTask(task: Task): void {
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
