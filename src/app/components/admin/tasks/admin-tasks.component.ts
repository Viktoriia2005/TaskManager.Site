// English: Material-based read-only tasks view (mat-table + mat-menu filters)
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { TasksService, Task } from '../../../services/tasks.service';
import { CategoriesService, Category } from '../../../services/categories.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-tasks',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSortModule
  ],
  templateUrl: './admin-tasks.component.html',
  styleUrls: ['./admin-tasks.component.scss']
})
export class AdminTasksComponent implements OnInit {
  // English: table and sorting
  displayedColumns: string[] = ['title', 'priority', 'status', 'user'];
  dataSource = new MatTableDataSource<Task>([]);
  @ViewChild(MatSort) sort!: MatSort;

  // English: data
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  categories: Category[] = [];
  adminName: string | null = null;

  // English: sort state (kept for UI arrows)
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private tasksService: TasksService,
    private categoriesService: CategoriesService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadTasks();
    this.loadCategories();
    this.loadAdminName();
  }

  ngAfterViewInit(): void {
    // English: attach MatSort to dataSource
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  /** Load tasks from backend */
  loadTasks(): void {
    this.tasksService.getTasks().subscribe({
      next: (data: Task[]) => {
        this.tasks = data;
        this.filteredTasks = [...data];
        this.dataSource.data = this.filteredTasks;
      },
      error: (err: any) => console.error('Failed to load tasks:', err)
    });
  }

  /** Load categories (kept for potential future use) */
  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (data: Category[]) => this.categories = data,
      error: (err: any) => console.error('Failed to load categories:', err)
    });
  }

  /** Load admin name from user profile */
  loadAdminName(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.adminName = user.name;
      },
      error: (err) => {
        console.error('Failed to load admin name:', err);
        this.adminName = null;
      }
    });
  }

  /** Sorting for Title and User columns */
  sortTasks(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredTasks.sort((a, b) => {
      const valueA = column === 'user' ? a.user?.name ?? '' : (a as any)[column] ?? '';
      const valueB = column === 'user' ? b.user?.name ?? '' : (b as any)[column] ?? '';

      return this.sortDirection === 'asc'
        ? valueA.toString().localeCompare(valueB.toString())
        : valueB.toString().localeCompare(valueA.toString());
    });

    // English: update dataSource for mat-table
    this.dataSource.data = this.filteredTasks;
  }

  /** Get sort arrow symbol for UI */
  getSortArrow(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  /** Apply filter (called from mat-menu items) */
  applyFilter(field: string, value: string | null): void {
    if (!value) {
      this.filteredTasks = [...this.tasks];
    } else {
      this.filteredTasks = this.tasks.filter(t => (t as any)[field] === value);
    }
    this.dataSource.data = this.filteredTasks;
  }

  /** Provide filter options */
  getFilterOptions(field: string): string[] {
    if (field === 'priority') return ['low', 'medium', 'high'];
    if (field === 'status') return ['new', 'in_progress', 'done'];
    return [];
  }
}