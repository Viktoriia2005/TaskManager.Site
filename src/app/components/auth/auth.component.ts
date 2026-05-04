import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AuthService,
  AuthResponse,
  ProfileResponse,
} from '../../services/auth.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslationService } from '../../i18n/translation.service';

/* Angular Material modules used by this component */
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslatePipe,
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  isRegister = false;
  registerError = '';
  loginError = '';

  loginData = { email: '', password: '' };
  registerData = { name: '', email: '', password: '' };

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    public readonly translationService: TranslationService,
  ) { }

  /** Toggle between login and register mode */
  toggleMode(): void {
    this.isRegister = !this.isRegister;
    this.registerError = '';
    this.loginError = '';
  }

  /** Login user and sync language from DB */
  login(): void {
    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (res: AuthResponse) => {
        this.authService.saveSession(res);

        this.authService.getCurrentUser().subscribe({
          next: (res: ProfileResponse) => {
            const user = res.user;

            // Sync language from DB if available
            if (user?.language) {
              this.translationService.setLanguage(user.language as 'uk' | 'en');
            }

            if (user?.roleId === 1) {
              this.router.navigate(['/admin/roles']);
            } else {
              this.router.navigate(['/user/tasks']);
            }
          },
          error: () => {
            this.loginError = this.translationService.t('auth.profileFailed');
          },
        });
      },
      error: (err) => {
        this.loginError = this.extractErrorMessage(
          err,
          this.translationService.t('auth.loginFailed'),
        );
      },
    });
  }

  /** Register user and sync language from DB */
  register(): void {
    const validationMessage = this.validateRegisterForm();
    if (validationMessage) {
      this.registerError = validationMessage;
      return;
    }

    this.authService.register(
      this.registerData.name,
      this.registerData.email,
      this.registerData.password
    ).subscribe({
      next: (res: AuthResponse) => {
        this.authService.saveSession(res);

        this.authService.getCurrentUser().subscribe({
          next: (res: ProfileResponse) => {
            const user = res.user;

            // Sync language from DB if available
            if (user?.language) {
              this.translationService.setLanguage(user.language as 'uk' | 'en');
            }

            this.router.navigate(['/user/tasks']);
          },
          error: () => {
            this.registerError = this.translationService.t('auth.profileFailed');
          },
        });
      },
      error: (err) => {
        this.registerError = this.extractErrorMessage(
          err,
          this.translationService.t('auth.registerFailed'),
        );
      },
    });
  }

  /** Validate registration form fields */
  private validateRegisterForm(): string {
    const name = this.registerData.name.trim();
    const email = this.registerData.email.trim();
    const password = this.registerData.password;
    const strictEmailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const passwordRegex = /[A-Za-z]/;

    if (!name) {
      return this.translationService.t('auth.nameRequired');
    }

    if (!strictEmailRegex.test(email)) {
      return this.translationService.t('auth.emailAddressInvalid');
    }

    if (password.length < 6) {
      return this.translationService.t('auth.passwordTooShort');
    }

    if (!passwordRegex.test(password)) {
      return this.translationService.t('auth.passwordLatin');
    }

    return '';
  }

  /** Extract error message from backend response */
  private extractErrorMessage(err: unknown, fallback: string): string {
    const message = (err as { error?: { message?: string | string[] } })?.error?.message;

    if (Array.isArray(message)) {
      return message
        .map((item) => this.translationService.translateBackendMessage(item))
        .join(' ');
    }

    if (typeof message === 'string' && message.trim()) {
      return this.translationService.translateBackendMessage(message);
    }

    return fallback;
  }

  /** Change language manually */
  setLanguage(language: 'uk' | 'en'): void {
    this.translationService.setLanguage(language);
  }
}
