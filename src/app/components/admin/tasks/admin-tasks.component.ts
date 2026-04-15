import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService, Task } from '../../../services/tasks.service';
import { CategoriesService, Category } from '../../../services/categories.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-tasks.component.html',
  styleUrls: ['./admin-tasks.component.scss']
})
export class AdminTasksComponent implements OnInit {
  tasks: Task[] = [];
  categories: Category[] = [];
  showTaskModal = false;
  selectedTask: Task | null = null;
  isEditing = false;
  adminName: string | null = null;

  activeTask: Task | null = null;
  menuPosition = { top: 0, left: 0 };

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
      },
      error: (err) => {
        console.error('Failed to load tasks:', err);
      }
    });
  }

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  loadAdminName(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.adminName = currentUser.name;
    }
  }

  openAddModal(): void {
    this.selectedTask = {
      id: 0,
      title: '',
      description: '',
      priority: 'Low',
      status: 'Pending',
      deadline: '',        // ← замінено dueDate на deadline
      categoryId: null,
      userId: 0,
      user: undefined,     // ← null замінено на undefined
      category: null
    };
    this.isEditing = false;
    this.showTaskModal = true;
  }

  editTask(task: Task): void {
    this.selectedTask = { ...task };
    this.isEditing = true;
    this.showTaskModal = true;
  }

  saveTask(): void {
    if (!this.selectedTask || !this.selectedTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    if (this.isEditing && this.selectedTask.id > 0) {
      this.tasksService.updateTask(this.selectedTask.id, this.selectedTask).subscribe({
        next: (updatedTask) => {
          const index = this.tasks.findIndex(t => t.id === updatedTask.id);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
          }
          this.cancel();
        },
        error: (err) => {
          console.error('Failed to update task:', err);
        }
      });
    } else {
      this.tasksService.createTask(this.selectedTask).subscribe({
        next: (newTask) => {
          this.tasks.push(newTask);
          this.cancel();
        },
        error: (err) => {
          console.error('Failed to create task:', err);
        }
      });
    }
  }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tasksService.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete task:', err);
        }
      });
    }
  }

  toggleMenu(task: Task, event: MouseEvent): void {
    event.stopPropagation();
    this.activeTask = task;
    this.menuPosition = { top: event.clientY, left: event.clientX };
  }

  cancel(): void {
    this.showTaskModal = false;
    this.selectedTask = null;
    this.isEditing = false;
    this.activeTask = null;
  }
}
