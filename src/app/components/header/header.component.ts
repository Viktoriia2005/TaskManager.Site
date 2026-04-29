import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  AuthService,
  ProfileResponse,
} from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslationService } from '../../i18n/translation.service';
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
    TranslatePipe,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() userName = '';
  @Input() title = '';
  @Input() welcomePrefix = '';
  @Input() theme: 'user' | 'admin' = 'user';
  @Input() tasks: { id: number; title: string }[] = [];
  @Output() logoutClick = new EventEmitter<void>();

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    public readonly translationService: TranslationService,
  ) {}

  logout(): void {
    this.logoutClick.emit();
  }

  get displayUserName(): string {
    return this.userName || this.translationService.t('common.user');
  }

  openChangePasswordDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '420px',
    });

    dialogRef
      .afterClosed()
      .subscribe((result: ChangePasswordDialogResult | undefined) => {
        if (!result) {
          return;
        }

        this.authService.getCurrentUser().subscribe({
          next: (res: ProfileResponse) => {
            const userId = res.user.userId ?? res.user.id;
            if (!userId) {
              this.snackBar.open(
                this.translationService.t('password.identifyFailed'),
                this.translationService.t('common.close'),
                {
                  duration: 3000,
                },
              );
              return;
            }

            this.usersService.changePassword(userId, result).subscribe({
              next: () => {
                this.snackBar.open(
                  this.translationService.t('password.changeSuccess'),
                  this.translationService.t('common.close'),
                  {
                    duration: 3000,
                  },
                );
              },
              error: (err) => {
                const backendMessage =
                  typeof err?.error?.message === 'string'
                    ? this.translationService.translateBackendMessage(
                        err.error.message,
                      )
                    : this.translationService.t('password.changeFailed');

                this.snackBar.open(
                  backendMessage,
                  this.translationService.t('common.close'),
                  { duration: 4000 },
                );
              },
            });
          },
          error: () => {
            this.snackBar.open(
              this.translationService.t('password.loadUserFailed'),
              this.translationService.t('common.close'),
              {
                duration: 3000,
              },
            );
          },
        });
      });
  }

  setLanguage(language: 'uk' | 'en'): void {
    this.translationService.setLanguage(language);
  }
}
