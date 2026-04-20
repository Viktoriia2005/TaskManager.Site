import { Component, OnInit, ViewChild, TemplateRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../header/header.component';
import { TasksService, Task } from '../../../services/tasks.service';
import { CategoriesService, Category } from '../../../services/categories.service';
import { AuthService } from '../../../services/auth.service';

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
    MatToolbarModule
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
  currentUser: any = null;
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
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Fetch current user profile
    this.authService.getCurrentUser().subscribe({
      next: (res) => {
        this.currentUser = res.user; // FIX: use nested user object

        if (this.currentUser.roleId === 1) {
          // Admin: load all tasks
          this.tasksService.getTasks().subscribe((tasks) => {
            this.tasks = tasks;
            this.filteredTasks = [...tasks];
            this.dataSource.data = this.filteredTasks;
          });
        } else {
          // User: load only own tasks
          this.tasksService.getTasks(this.currentUser.id).subscribe((tasks) => {
            this.tasks = tasks;
            this.filteredTasks = [...tasks];
            this.dataSource.data = this.filteredTasks;
          });
        }
      },
      error: (err) => {
        console.error('Failed to load current user:', err);
        this.currentUser = null;

        // Fallback: load all tasks if no currentUser
        this.tasksService.getTasks().subscribe((tasks) => {
          this.tasks = tasks;
          this.filteredTasks = [...tasks];
          this.dataSource.data = this.filteredTasks;
        });
      }
    });

    // Load categories for filtering
    this.categoriesService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  // Sorting logic
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredTasks.sort((a: any, b: any) => {
      const valA = (a[field] ?? '').toString().toLowerCase();
      const valB = (b[field] ?? '').toString().toLowerCase();

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.dataSource.data = this.filteredTasks;
  }

  // Apply filters
  applyFilter(field: string, value: string | null): void {
    if (!value) {
      this.filteredTasks = [...this.tasks];
    } else {
      if (field === 'category') {
        this.filteredTasks = this.tasks.filter(t => t.category?.name === value);
      } else {
        this.filteredTasks = this.tasks.filter(t => (t as any)[field] === value);
      }
    }
    this.dataSource.data = this.filteredTasks;
  }

  // Get filter options
  getFilterOptions(field: string): string[] {
    if (field === 'priority') return ['low', 'medium', 'high'];
    if (field === 'status') return ['new', 'in_progress', 'done'];
    if (field === 'category') return this.categories.map(c => c.name);
    return [];
  }

  // Navigation actions
  addTask(): void {
    this.router.navigate(['/user/tasks/new']);
  }

  editTask(task: Task | null): void {
    if (!task) return;
    this.router.navigate(['/user/tasks', task.id, 'edit']);
    this.activeTask = null;
  }

  // Row menu helpers
  setActiveTask(task: Task | null, event: MouseEvent): void {
    event.stopPropagation();
    this.activeTask = task;
  }

  // Delete dialog
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
      error: (err: any) => {
        console.error('Failed to delete task:', err);
        this.dialogRef?.close();
        this.activeTask = null;
      }
    });
  }

  // Context menu toggle
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.mat-menu-panel') && !target.closest('.menu-btn')) {
      this.activeTask = null;
    }
  }

  // Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}