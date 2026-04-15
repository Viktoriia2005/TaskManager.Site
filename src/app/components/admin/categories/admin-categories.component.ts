import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesService, Category } from '../../../services/categories.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss']
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  showCategoryModal = false;
  selectedCategory: Partial<Category> | null = null; // тепер Partial<Category>
  isEditing = false;
  adminName: string | null = null;

  constructor(
    private categoriesService: CategoriesService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadAdminName();
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
    // створюємо без id
    this.selectedCategory = { name: '' };
    this.isEditing = false;
    this.showCategoryModal = true;
  }

  editCategory(category: Category): void {
    this.selectedCategory = { ...category };
    this.isEditing = true;
    this.showCategoryModal = true;
  }

  saveCategory(): void {
    if (!this.selectedCategory || !this.selectedCategory.name?.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (this.isEditing && this.selectedCategory.id) {
      this.categoriesService.updateCategory(this.selectedCategory.id, this.selectedCategory).subscribe({
        next: (updatedCategory) => {
          const index = this.categories.findIndex(c => c.id === updatedCategory.id);
          if (index !== -1) {
            this.categories[index] = updatedCategory;
          }
          this.cancel();
        },
        error: (err) => {
          console.error('Failed to update category:', err);
        }
      });
    } else {
      this.categoriesService.createCategory({
        name: this.selectedCategory.name!,
        description: this.selectedCategory.description
      }).subscribe({
        next: (newCategory) => {
          this.categories.push(newCategory);
          this.cancel();
        },
        error: (err) => {
          console.error('Failed to create category:', err);
        }
      });
    }
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoriesService.deleteCategory(id).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete category:', err);
        }
      });
    }
  }

  cancel(): void {
    this.showCategoryModal = false;
    this.selectedCategory = null;
    this.isEditing = false;
  }
}
