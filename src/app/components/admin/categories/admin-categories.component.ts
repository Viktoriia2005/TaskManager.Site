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
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslationService } from '../../../i18n/translation.service';
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
    TranslatePipe,
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
    public readonly translationService: TranslationService,
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
        console.error(this.translationService.t('admin.categories.loadFailed'), err);
        this.snackBar.open(
          this.translationService.t('admin.categories.loadFailed'),
          this.translationService.t('common.close'),
          { duration: 3000 },
        );
      },
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(CategoryDialogComponent, {
      width: '420px',
      data: { title: this.translationService.t('admin.categories.addDialog'), category: { name: '' } },
    });

    ref.afterClosed().subscribe((result: Partial<Category> | undefined) => {
      if (result) {
        this.categoriesService.createCategory(result as Category).subscribe({
          next: (newCategory) => {
            this.categories.push(newCategory);
            this.dataSource.data = [...this.categories];
            this.snackBar.open(
              this.translationService.t('admin.categories.createSuccess'),
              this.translationService.t('common.close'),
              { duration: 2000 },
            );
          },
          error: (err) => {
            console.error(this.translationService.t('admin.categories.createFailed'), err);
            this.snackBar.open(
              this.translationService.t('admin.categories.createFailed'),
              this.translationService.t('common.close'),
              { duration: 3000 },
            );
          },
        });
      }
    });
  }

  openEditDialog(category: Category): void {
    const ref = this.dialog.open(CategoryDialogComponent, {
      width: '420px',
      data: { title: this.translationService.t('admin.categories.editDialog'), category: { ...category } },
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
            this.snackBar.open(
              this.translationService.t('admin.categories.updateSuccess'),
              this.translationService.t('common.close'),
              { duration: 2000 },
            );
          },
          error: (err) => {
            console.error(this.translationService.t('admin.categories.updateFailed'), err);
            this.snackBar.open(
              this.translationService.t('admin.categories.updateFailed'),
              this.translationService.t('common.close'),
              { duration: 3000 },
            );
          },
        });
      }
    });
  }

  openDeleteDialog(category: Category): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        message: this.translationService.t('admin.categories.deleteMessage', {
          name: category.name,
        }),
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed) {
        this.categoriesService.deleteCategory(category.id!).subscribe({
          next: () => {
            this.categories = this.categories.filter((item) => item.id !== category.id);
            this.dataSource.data = [...this.categories];
            this.snackBar.open(
              this.translationService.t('admin.categories.deleteSuccess'),
              this.translationService.t('common.close'),
              { duration: 2000 },
            );
          },
          error: (err) => {
            console.error(this.translationService.t('admin.categories.deleteFailed'), err);
            this.snackBar.open(
              this.translationService.t('admin.categories.deleteFailed'),
              this.translationService.t('common.close'),
              { duration: 3000 },
            );
          },
        });
      }
    });
  }

  translateCategory(categoryName: string): string {
    return this.translationService.translateCategory(categoryName);
  }
}
