import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import {
  ChangePasswordDialogComponent,
  ChangePasswordDialogResult,
} from './change-password-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() userName = 'User';
  @Input() title = 'Task Manager';
  @Input() welcomePrefix = '';
  @Input() theme: 'user' | 'admin' = 'user';
  @Input() tasks: { id: number; title: string }[] = [];
  @Output() logoutClick = new EventEmitter<void>();

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  logout(): void {
    this.logoutClick.emit();
  }

  openChangePasswordDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '420px',
    });

    dialogRef.afterClosed().subscribe((result: ChangePasswordDialogResult | undefined) => {
      if (!result) {
        return;
      }

      this.authService.getCurrentUser().subscribe({
        next: (res) => {
          const userId = res?.user?.userId ?? res?.user?.id;
          if (!userId) {
            this.snackBar.open('Failed to identify the current user.', 'Close', {
              duration: 3000,
            });
            return;
          }

          this.usersService.changePassword(userId, result).subscribe({
            next: () => {
              this.snackBar.open('Password changed successfully.', 'Close', {
                duration: 3000,
              });
            },
            error: (err) => {
              const message =
                err?.error?.message ||
                'Failed to change password. Please check your current password.';
              this.snackBar.open(message, 'Close', { duration: 4000 });
            },
          });
        },
        error: () => {
          this.snackBar.open('Failed to load the current user.', 'Close', {
            duration: 3000,
          });
        },
      });
    });
  }
}
