import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { HeaderComponent } from '../../header/header.component';
import { TasksService, Task } from '../../../services/tasks.service';
import { CategoriesService, Category } from '../../../services/categories.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-tasks',
  standalone: true,
  imports: [CommonModule, HeaderComponent, DatePipe],
  templateUrl: './user-tasks.component.html',
  styleUrls: ['./user-tasks.component.scss']
})
export class UserTasksComponent implements OnInit {
  currentUser: ReturnType<AuthService['getCurrentUser']> = null;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  categories: Category[] = [];

  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  activeTask: Task | null = null;
  menuPosition = { top: 0, left: 0 };

  activeFilter: string | null = null;
  filterMenuPosition = { top: 0, left: 0 };

  // Modal state for delete confirmation
  showDeleteModal = false;
  selectedTask: Task | null = null;

  constructor(
    private tasksService: TasksService,
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (this.currentUser) {
      this.tasksService.getTasks(this.currentUser.id).subscribe((tasks) => {
        this.tasks = tasks;
        this.filteredTasks = [...tasks];
      });
    }

    this.categoriesService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredTasks.sort((a: any, b: any) => {
      const valA = (a[field] || '').toString().toLowerCase();
      const valB = (b[field] || '').toString().toLowerCase();

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

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
    this.activeFilter = null;
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

  editTask(task: Task): void {
    this.router.navigate(['/user/tasks', task.id, 'edit']);
    this.activeTask = null;
  }

  // Open delete confirmation modal
  confirmDelete(task: Task): void {
    this.selectedTask = task;
    this.showDeleteModal = true;
    this.activeTask = null;
  }

  // Delete task after confirmation
  deleteTaskConfirmed(): void {
    if (this.selectedTask) {
      this.tasksService.deleteTask(this.selectedTask.id).subscribe(() => {
        this.tasks = this.tasks.filter(t => t.id !== this.selectedTask!.id);
        this.filteredTasks = this.filteredTasks.filter(t => t.id !== this.selectedTask!.id);
        this.cancelDelete();
      });
    }
  }

  // Cancel delete modal
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.selectedTask = null;
  }

  toggleMenu(task: Task, event: MouseEvent): void {
    if (this.activeTask && this.activeTask.id === task.id) {
      this.activeTask = null;
      return;
    }
    this.activeTask = task;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.menuPosition = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    };
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-btn') && !target.closest('.dropdown-menu')) {
      this.activeTask = null;
      this.activeFilter = null;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}