import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CategoriesService, Category } from '../../../services/categories.service';
import { CategoryDialogComponent } from './category-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
  ],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss'],
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  dataSource = new MatTableDataSource<Category>([]);
  displayedColumns: string[] = ['name', 'actions'];

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.dataSource.data = data;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.snackBar.open('Failed to load categories', 'Close', { duration: 3000 });
      },
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(CategoryDialogComponent, {
      width: '420px',
      data: { title: 'Add new category', category: { name: '', description: '' } },
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
          },
        });
      }
    });
  }

  openEditDialog(category: Category): void {
    const ref = this.dialog.open(CategoryDialogComponent, {
      width: '420px',
      data: { title: 'Edit category', category: { ...category } },
    });

    ref.afterClosed().subscribe((result: Partial<Category> | undefined) => {
      if (result && result.id) {
        this.categoriesService.updateCategory(result.id, result as Category).subscribe({
          next: (updated) => {
            const idx = this.categories.findIndex((item) => item.id === updated.id);
            if (idx !== -1) {
              this.categories[idx] = updated;
              this.dataSource.data = [...this.categories];
            }
            this.snackBar.open('Category updated', 'Close', { duration: 2000 });
          },
          error: (err) => {
            console.error('Failed to update category:', err);
            this.snackBar.open('Failed to update category', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  openDeleteDialog(category: Category): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: { message: `Are you sure you want to delete category "${category.name}"?` },
    });

    ref.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed) {
        this.categoriesService.deleteCategory(category.id!).subscribe({
          next: () => {
            this.categories = this.categories.filter((item) => item.id !== category.id);
            this.dataSource.data = [...this.categories];
            this.snackBar.open('Category deleted', 'Close', { duration: 2000 });
          },
          error: (err) => {
            console.error('Failed to delete category:', err);
            this.snackBar.open('Failed to delete category', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }
}
