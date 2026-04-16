import { Component, OnInit, HostListener } from '@angular/core';
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
  // List of categories
  categories: Category[] = [];

  // Modal states
  showCategoryModal = false;
  showDeleteModal = false;

  // Selected category for editing/deleting
  selectedCategory: Partial<Category> | null = null;
  isEditing = false;

  // Current admin name
  adminName: string | null = null;

  constructor(
    private categoriesService: CategoriesService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadAdminName();
  }

  // Load all categories
  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Failed to load categories:', err)
    });
  }

  // Load current admin name
  loadAdminName(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.adminName = currentUser.name;
    }
  }

  // Open add modal
  openAddModal(): void {
    this.selectedCategory = { name: '' };
    this.isEditing = false;
    this.showCategoryModal = true;
  }

  // Open edit modal (from button or double click)
  editCategory(category: Category): void {
    this.selectedCategory = { ...category };
    this.isEditing = true;
    this.showCategoryModal = true;
  }

  // Save category (create or update)
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
        error: (err) => console.error('Failed to update category:', err)
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
        error: (err) => console.error('Failed to create category:', err)
      });
    }
  }

  // Open delete confirmation modal
  confirmDelete(category: Category): void {
    this.selectedCategory = { ...category };
    this.showDeleteModal = true;
  }

  // Delete category after confirmation
  deleteCategoryConfirmed(): void {
    if (this.selectedCategory?.id) {
      this.categoriesService.deleteCategory(this.selectedCategory.id).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.id !== this.selectedCategory!.id);
          this.cancelDelete();
        },
        error: (err) => console.error('Failed to delete category:', err)
      });
    }
  }

  // Cancel edit modal
  cancel(): void {
    this.showCategoryModal = false;
    this.selectedCategory = null;
    this.isEditing = false;
  }

  // Cancel delete modal
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.selectedCategory = null;
  }
}