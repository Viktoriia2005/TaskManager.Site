import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Category } from '../../../services/categories.service';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-title>{{ data.title }}</mat-card-title>
      <mat-card-content>
        <form class="dialog-form" (ngSubmit)="onSave()">
          <!-- English: only keep the Name field, remove Description -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Name</mat-label>
            <input matInput [(ngModel)]="category.name" name="name" required />
          </mat-form-field>
        </form>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="primary" (click)="onSave()">Save</button>
      </mat-card-actions>
    </mat-card>
  `
})
export class CategoryDialogComponent {
  // English: keep only the fields you actually use (name)
  category: Partial<Category>;

  constructor(
    public dialogRef: MatDialogRef<CategoryDialogComponent, Partial<Category> | undefined>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; category: Partial<Category> }
  ) {
    // English: initialize with provided data (only name expected)
    this.category = { name: data.category?.name ?? '' };
  }

  // English: close dialog and return the category object (only name)
  onSave(): void {
    if (!this.category.name || !this.category.name.trim()) {
      return;
    }
    this.dialogRef.close(this.category);
  }

  // English: close without returning data
  onCancel(): void {
    this.dialogRef.close(undefined);
  }
}