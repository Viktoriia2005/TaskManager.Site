import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Material modules used by this standalone component
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

import { CategoriesService, Category } from '../../../services/categories.service';
import { AuthService } from '../../../services/auth.service';

// Import standalone dialog components and include them in imports array.
import { CategoryDialogComponent } from './category-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,

    // Include standalone dialog components here so they can be used by MatDialog.
    CategoryDialogComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss']
})
export class AdminCategoriesComponent implements OnInit {
  // Data source for the Material table
  categories: Category[] = [];
  dataSource = new MatTableDataSource<Category>([]);
  displayedColumns: string[] = ['name', 'actions'];

  // Admin name shown in toolbar
  adminName: string | null = null;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadAdminName();
  }

  ngAfterViewInit(): void {
    // Attach sorting to the data source after view init
    this.dataSource.sort = this.sort;
  }

  /** Load categories from backend */
  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.dataSource.data = data;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.snackBar.open('Failed to load categories', 'Close', { duration: 3000 });
      }
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

  /** Open dialog to add category */
  openAddDialog(): void {
    const ref = this.dialog.open(CategoryDialogComponent, {
      width: '420px',
      data: { title: 'Add new category', category: { name: '', description: '' } }
    });

    ref.afterClosed().subscribe((result: Partial<Category> | undefined) => {
      if (result) {
        this.categoriesService.createCategory(result as Category).subscribe({
          next: (newCategory) => {
            this.categories.push(newCategory);
            this.dataSource.data = [...this.categories];
            this.snackBar.open('Category created', 'Close', { duration: 2000 });
          },
          error: (err) => {
            console.error('Failed to create category:', err);
            this.snackBar.open('Failed to create category', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  /** Open dialog to edit category */
  openEditDialog(category: Category): void {
    const ref = this.dialog.open(CategoryDialogComponent, {
      width: '420px',
      data: { title: 'Edit category', category: { ...category } }
    });

    ref.afterClosed().subscribe((result: Partial<Category> | undefined) => {
      if (result && result.id) {
        this.categoriesService.updateCategory(result.id, result as Category).subscribe({
          next: (updated) => {
            const idx = this.categories.findIndex(c => c.id === updated.id);
            if (idx !== -1) {
              this.categories[idx] = updated;
              this.dataSource.data = [...this.categories];
            }
            this.snackBar.open('Category updated', 'Close', { duration: 2000 });
          },
          error: (err) => {
            console.error('Failed to update category:', err);
            this.snackBar.open('Failed to update category', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  /** Open dialog to delete category */
  openDeleteDialog(category: Category): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: { message: `Are you sure you want to delete category "${category.name}"?` }
    });

    ref.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed) {
        this.categoriesService.deleteCategory(category.id!).subscribe({
          next: () => {
            this.categories = this.categories.filter(c => c.id !== category.id);
            this.dataSource.data = [...this.categories];
            this.snackBar.open('Category deleted', 'Close', { duration: 2000 });
          },
          error: (err) => {
            console.error('Failed to delete category:', err);
            this.snackBar.open('Failed to delete category', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}