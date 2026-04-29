import { Component, OnInit, ViewChild, TemplateRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../header/header.component';
import { TasksService, Task } from '../../../services/tasks.service';
import { CategoriesService, Category } from '../../../services/categories.service';
import {
  AuthService,
  CurrentUser,
  ProfileResponse,
} from '../../../services/auth.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslationService } from '../../../i18n/translation.service';
import { AppDatePipe } from '../../../shared/app-date.pipe';

import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-user-tasks',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSortModule,
    MatToolbarModule,
    TranslatePipe,
    AppDatePipe,
  ],
  templateUrl: './user-tasks.component.html',
  styleUrls: ['./user-tasks.component.scss']
})
export class UserTasksComponent implements OnInit {
  // Table setup
  displayedColumns: string[] = ['title', 'priority', 'status', 'deadline', 'category', 'actions'];
  dataSource = new MatTableDataSource<Task>([]);
  @ViewChild(MatSort) sort!: MatSort;

  // Current user profile
  currentUser: CurrentUser | null = null;
  // Tasks data
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  categories: Category[] = [];

  // Sorting state
  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Active row/menu
  activeTask: Task | null = null;

  // Dialog refs
  @ViewChild('deleteDialog') deleteDialogTpl!: TemplateRef<any>;
  dialogRef: MatDialogRef<any> | null = null;

  constructor(
    private tasksService: TasksService,
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    public readonly translationService: TranslationService,
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (res: ProfileResponse) => {
        this.currentUser = res.user;

        if (this.currentUser.roleId === 1) {
          this.tasksService.getTasks().subscribe((tasks) => {
            this.tasks = tasks;
            this.filteredTasks = [...tasks];
            this.dataSource.data = this.filteredTasks;
          });
        } else {
          this.tasksService.getTasks(this.currentUser.id).subscribe((tasks) => {
            this.tasks = tasks;
            this.filteredTasks = [...tasks];
            this.dataSource.data = this.filteredTasks;
          });
        }
      },
      error: (err) => {
        console.error(this.translationService.t('error.loadCurrentUser'), err);
        this.currentUser = null;

        this.tasksService.getTasks().subscribe((tasks) => {
          this.tasks = tasks;
          this.filteredTasks = [...tasks];
          this.dataSource.data = this.filteredTasks;
        });
      }
    });

    this.categoriesService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredTasks.sort((a, b) => {
      const valA = this.getSortableValue(a, field);
      const valB = this.getSortableValue(b, field);

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.dataSource.data = this.filteredTasks;
  }

  applyFilter(field: string, value: string | null): void {
    if (!value) {
      this.filteredTasks = [...this.tasks];
    } else {
      if (field === 'category') {
        this.filteredTasks = this.tasks.filter(
          (task) =>
            this.translationService.translateCategory(task.category?.name ?? '') ===
            value,
        );
      } else {
        this.filteredTasks = this.tasks.filter((task) => this.matchesFilter(task, field, value));
      }
    }
    this.dataSource.data = this.filteredTasks;
  }

  getFilterOptions(field: string): string[] {
    if (field === 'priority') return ['low', 'medium', 'high'];
    if (field === 'status') return ['new', 'in_progress', 'done'];
    if (field === 'category') return this.categories.map(c => c.name);
    return [];
  }

  addTask(): void {
    this.router.navigate(['/user/tasks/new']);
  }

  editTask(task: Task | null): void {
    if (!task) return;
    this.router.navigate(['/user/tasks', task.id, 'edit']);
    this.activeTask = null;
  }

  setActiveTask(task: Task | null, event: MouseEvent): void {
    event.stopPropagation();
    this.activeTask = task;
  }

  openDeleteDialog(task: Task | null): void {
    if (!task) return;
    this.activeTask = task;
    this.dialogRef = this.dialog.open(this.deleteDialogTpl, { data: task, width: '420px' });
  }

  deleteTaskConfirmed(): void {
    if (!this.activeTask) return;
    this.tasksService.deleteTask(this.activeTask.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== this.activeTask!.id);
        this.filteredTasks = this.filteredTasks.filter(t => t.id !== this.activeTask!.id);
        this.dataSource.data = this.filteredTasks;
        this.dialogRef?.close();
        this.activeTask = null;
      },
      error: (err) => {
        console.error(this.translationService.t('common.delete'), err);
        this.dialogRef?.close();
        this.activeTask = null;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.mat-menu-panel') && !target.closest('.menu-btn')) {
      this.activeTask = null;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  translatePriority(priority: string): string {
    return this.translationService.translatePriority(priority);
  }

  translateStatus(status: string): string {
    return this.translationService.translateStatus(status);
  }

  getDeleteMessage(title: string | undefined): string {
    return this.translationService.t('task.deleteConfirm', { title: title ?? '' });
  }

  translateCategory(categoryName: string): string {
    return this.translationService.translateCategory(categoryName);
  }

  private getSortableValue(task: Task, field: string): string {
    const sortableFields: Record<string, string> = {
      title: task.title,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline instanceof Date ? task.deadline.toISOString() : String(task.deadline),
      category: this.translationService.translateCategory(task.category?.name ?? ''),
    };

    return (sortableFields[field] ?? '').toLowerCase();
  }

  private matchesFilter(task: Task, field: string, value: string): boolean {
    if (field === 'priority') {
      return task.priority === value;
    }

    if (field === 'status') {
      return task.status === value;
    }

    return false;
  }
}
