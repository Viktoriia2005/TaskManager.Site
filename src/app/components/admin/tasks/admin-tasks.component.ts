import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslationService } from '../../../i18n/translation.service';
import { Category, CategoriesService } from '../../../services/categories.service';
import { Task, TasksService } from '../../../services/tasks.service';

@Component({
  selector: 'app-admin-tasks',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSortModule,
    TranslatePipe,
  ],
  templateUrl: './admin-tasks.component.html',
  styleUrls: ['./admin-tasks.component.scss'],
})
export class AdminTasksComponent implements OnInit {
  displayedColumns: string[] = ['title', 'priority', 'status', 'user'];
  dataSource = new MatTableDataSource<Task>([]);
  @ViewChild(MatSort) sort!: MatSort;

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  categories: Category[] = [];

  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private readonly tasksService: TasksService,
    private readonly categoriesService: CategoriesService,
    public readonly translationService: TranslationService,
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  loadTasks(): void {
    this.tasksService.getTasks().subscribe({
      next: (data: Task[]) => {
        this.tasks = data;
        this.filteredTasks = [...data];
        this.dataSource.data = this.filteredTasks;
      },
      error: (err) =>
        console.error(this.translationService.t('error.loadTasks'), err),
    });
  }

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (data: Category[]) => (this.categories = data),
      error: (err) =>
        console.error(this.translationService.t('admin.categories.loadFailed'), err),
    });
  }

  sortTasks(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredTasks.sort((a, b) => {
      const valueA = this.getSortValue(a, column);
      const valueB = this.getSortValue(b, column);

      return this.sortDirection === 'asc'
        ? valueA.toString().localeCompare(valueB.toString())
        : valueB.toString().localeCompare(valueA.toString());
    });

    this.dataSource.data = this.filteredTasks;
  }

  getSortArrow(column: string): string {
    if (this.sortColumn !== column) return '<->';
    return this.sortDirection === 'asc' ? '^' : 'v';
  }

  applyFilter(field: string, value: string | null): void {
    if (!value) {
      this.filteredTasks = [...this.tasks];
    } else {
      this.filteredTasks = this.tasks.filter((task) => (task as any)[field] === value);
    }
    this.dataSource.data = this.filteredTasks;
  }

  getFilterOptions(field: string): string[] {
    if (field === 'priority') return ['low', 'medium', 'high'];
    if (field === 'status') return ['new', 'in_progress', 'done'];
    return [];
  }

  translatePriority(priority: string): string {
    return this.translationService.translatePriority(priority);
  }

  translateStatus(status: string): string {
    return this.translationService.translateStatus(status);
  }

  private getSortValue(task: Task, column: string): string {
    if (column === 'user') {
      return task.user?.name ?? '';
    }

    if (column === 'title') {
      return task.title;
    }

    return '';
  }
}
