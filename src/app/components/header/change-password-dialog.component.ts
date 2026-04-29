import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslationService } from '../../i18n/translation.service';

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
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'password.title' | t }}</h2>
    <mat-dialog-content>
      <form class="dialog-form">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>{{ 'password.current' | t }}</mat-label>
          <input matInput type="password" [(ngModel)]="currentPassword" name="currentPassword" />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>{{ 'password.new' | t }}</mat-label>
          <input matInput type="password" [(ngModel)]="newPassword" name="newPassword" />
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>{{ 'password.confirm' | t }}</mat-label>
          <input matInput type="password" [(ngModel)]="confirmPassword" name="confirmPassword" />
        </mat-form-field>

        <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">{{ 'common.cancel' | t }}</button>
      <button mat-flat-button color="primary" (click)="submit()">{{ 'common.save' | t }}</button>
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
    private readonly translationService: TranslationService,
  ) {}

  submit(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = this.translationService.t('password.required');
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = this.translationService.t('password.minLength');
      return;
    }

    if (!/[A-Za-z]/.test(this.newPassword)) {
      this.errorMessage = this.translationService.t('password.latin');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = this.translationService.t('password.mismatch');
      return;
    }

    this.dialogRef.close({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
    });
  }
}
