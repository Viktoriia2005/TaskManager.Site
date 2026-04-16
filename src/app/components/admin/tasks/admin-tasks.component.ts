import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksService, Task } from '../../../services/tasks.service';
import { CategoriesService, Category } from '../../../services/categories.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-tasks.component.html',
  styleUrls: ['./admin-tasks.component.scss']
})
export class AdminTasksComponent implements OnInit {
  tasks: Task[] = [];              // all tasks
  filteredTasks: Task[] = [];      // tasks after filters/sorting
  categories: Category[] = [];     // categories
  adminName: string | null = null; // current admin name

  sortColumn: string = '';         // current sort column
  sortDirection: 'asc' | 'desc' = 'asc'; // sort direction

  activeFilter: string | null = null; // which filter menu is open
  filterMenuPosition = { top: 0, left: 0 };

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

  loadTasks(): void {
    this.tasksService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.filteredTasks = [...data];
      },
      error: (err) => console.error('Failed to load tasks:', err)
    });
  }

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Failed to load categories:', err)
    });
  }

  loadAdminName(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) this.adminName = currentUser.name;
  }

  // Sorting for Title and User
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
  }

  getSortArrow(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  // Toggle filter menu
  toggleFilterMenu(field: string, event: MouseEvent): void {
    if (this.activeFilter === field) {
      this.activeFilter = null;
      return;
    }
    this.activeFilter = field;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.filterMenuPosition = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    };
  }

  // Apply filter
  applyFilter(field: string, value: string | null): void {
    if (!value) {
      this.filteredTasks = [...this.tasks];
    } else {
      this.filteredTasks = this.tasks.filter(t => (t as any)[field] === value);
    }
    this.activeFilter = null;
  }

  // Get filter options
  getFilterOptions(field: string): string[] {
    if (field === 'priority') return ['low', 'medium', 'high'];
    if (field === 'status') return ['new', 'in_progress', 'done'];
    return [];
  }

  // Close filter menu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-btn') && !target.closest('.dropdown-menu')) {
      this.activeFilter = null;
    }
  }
}