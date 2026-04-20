import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ChangePasswordDialogResult {
  currentPassword: string;
  newPassword: string;
}

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Change Password</h2>
    <mat-dialog-content>
      <form class="dialog-form">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Current password</mat-label>
          <input matInput type="password" [(ngModel)]="currentPassword" name="currentPassword" />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>New password</mat-label>
          <input matInput type="password" [(ngModel)]="newPassword" name="newPassword" />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Confirm new password</mat-label>
          <input matInput type="password" [(ngModel)]="confirmPassword" name="confirmPassword" />
        </mat-form-field>

        <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="submit()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 320px;
      padding-top: 8px;
    }

    .full-width {
      width: 100%;
    }

    .error-message {
      margin: 0;
      color: #b42318;
      font-size: 0.9rem;
    }
  `],
})
export class ChangePasswordDialogComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(
    public readonly dialogRef: MatDialogRef<
      ChangePasswordDialogComponent,
      ChangePasswordDialogResult | undefined
    >,
  ) {}

  submit(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'All password fields are required.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'New password must be at least 6 characters long.';
      return;
    }

    if (!/[A-Za-z]/.test(this.newPassword)) {
      this.errorMessage = 'New password must contain at least one Latin letter.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New password confirmation does not match.';
      return;
    }

    this.dialogRef.close({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
    });
  }
}
