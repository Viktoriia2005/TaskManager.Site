import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { HeaderComponent } from '../../header/header.component';
import {
  AuthService,
  CurrentUser,
  ProfileResponse,
} from '../../../services/auth.service';
import { CategoriesService, Category } from '../../../services/categories.service';
import { Task, TaskPayload, TasksService } from '../../../services/tasks.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslationService } from '../../../i18n/translation.service';

/* Angular Material modules */
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-user-task-form',
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
    MatNativeDateModule,
    TranslatePipe,
  ],
  templateUrl: './user-task-form.component.html',
  styleUrls: ['./user-task-form.component.scss']
})
export class UserTaskFormComponent implements OnInit {
  taskId: number | null = null;
  currentUser: CurrentUser | null = null;
  headerTasks: { id: number; title: string }[] = [];
  categories: Category[] = [];

  priorities = ['low', 'medium', 'high'];
  statuses = ['new', 'in_progress', 'done'];

  // Task model bound to form
  task: {
    title: string;
    description: string;
    priority: string;
    status: string;
    deadline: Date;
    categoryId: number | null;
  } = {
      title: '',
      description: '',
      priority: 'medium',
      status: 'new',
      deadline: new Date(), // default today
      categoryId: null
    };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private categoriesService: CategoriesService,
    private tasksService: TasksService,
    public readonly translationService: TranslationService,
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (res: ProfileResponse) => {
        this.currentUser = res.user;

        this.tasksService.getTasks(this.currentUser.id).subscribe((tasks) => {
          this.headerTasks = tasks.map(({ id: taskId, title }) => ({ id: taskId, title }));
        });
      },
      error: (err) => {
        console.error(this.translationService.t('error.loadCurrentUser'), err);
        this.currentUser = null;

        this.tasksService.getTasks().subscribe((tasks) => {
          this.headerTasks = tasks.map(({ id: taskId, title }) => ({ id: taskId, title }));
        });
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

    const payload: TaskPayload = this.tasksService.toPayload({
      title: this.task.title.trim(),
      description: this.task.description || '',
      priority: this.task.priority,
      status: this.task.status,
      deadline: deadlineValue,
      userId: Number(this.currentUser.id),
      categoryId: this.task.categoryId ?? null
    });

    const request = this.taskId
      ? this.tasksService.updateTask(this.taskId, payload)
      : this.tasksService.createTask(payload);

    request.subscribe({
      next: () => this.router.navigate(['/user/tasks']),
      error: (err) => console.error(this.translationService.t('error.saveTask'), err)
    });
  }

  /** Cancel and go back to tasks */
  cancel(): void {
    this.router.navigate(['/user/tasks']);
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
      categoryId: task.categoryId ?? task.category?.id ?? null
    };
  }

  translatePriority(priority: string): string {
    return this.translationService.translatePriority(priority);
  }

  translateStatus(status: string): string {
    return this.translationService.translateStatus(status);
  }

  translateCategory(categoryName: string): string {
    return this.translationService.translateCategory(categoryName);
  }
}
