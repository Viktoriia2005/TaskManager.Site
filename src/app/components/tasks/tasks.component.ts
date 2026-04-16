import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../services/auth.service';
import { CategoriesService, Category } from '../../services/categories.service';
import { Task, TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit {
  currentUser: ReturnType<AuthService['getCurrentUser']> = null;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  categories: Category[] = [];

  statuses = ['new', 'in progress', 'done'];
  priorities = ['low', 'medium', 'high'];

  selectedCategory = 'All';
  selectedStatus = 'All';
  selectedPriority = 'All';

  showStatusFilter = false;
  showPriorityFilter = false;
  openTaskMenuId: number | null = null;

  // Modal state for delete confirmation
  showDeleteModal = false;
  selectedTask: Task | null = null;

  constructor(
    private authService: AuthService,
    private categoriesService: CategoriesService,
    private tasksService: TasksService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadCategories();
    this.loadTasks();
  }

  loadTasks(): void {
    const userId = this.currentUser?.id;
    this.tasksService.getTasks(userId).subscribe((tasks) => {
      this.tasks = tasks;
      this.applyFilters();
    });
  }

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  toggleStatusFilter(): void {
    this.showStatusFilter = !this.showStatusFilter;
    if (this.showStatusFilter) {
      this.showPriorityFilter = false;
    }
  }

  togglePriorityFilter(): void {
    this.showPriorityFilter = !this.showPriorityFilter;
    if (this.showPriorityFilter) {
      this.showStatusFilter = false;
    }
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.showStatusFilter = false;
    this.applyFilters();
  }

  filterByPriority(priority: string): void {
    this.selectedPriority = priority;
    this.showPriorityFilter = false;
    this.applyFilters();
  }

  filterByCategory(): void {
    this.applyFilters();
  }

  addTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  editTask(task: Task): void {
    this.router.navigate(['/tasks', task.id, 'edit']);
  }

  // Open delete confirmation modal
  confirmDelete(task: Task): void {
    this.selectedTask = task;
    this.showDeleteModal = true;
    this.openTaskMenuId = null;
  }

  // Delete task after confirmation
  deleteTaskConfirmed(): void {
    if (this.selectedTask) {
      this.tasksService.deleteTask(this.selectedTask.id).subscribe(() => {
        this.loadTasks();
        this.cancelDelete();
      });
    }
  }

  // Cancel delete modal
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.selectedTask = null;
  }

  toggleTaskMenu(taskId: number): void {
    this.openTaskMenuId = this.openTaskMenuId === taskId ? null : taskId;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  private applyFilters(): void {
    this.filteredTasks = this.tasks.filter((task) => {
      const matchesStatus = this.selectedStatus === 'All' || task.status === this.selectedStatus;
      const matchesPriority = this.selectedPriority === 'All' || task.priority === this.selectedPriority;
      const categoryName = task.category?.name ?? 'Uncategorized';
      const matchesCategory = this.selectedCategory === 'All' || categoryName === this.selectedCategory;

      return matchesStatus && matchesPriority && matchesCategory;
    });
  }
}