import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
    MatButtonModule
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
    private authService: AuthService,
    private router: Router,
  ) { }

  /** Toggle between login and register mode */
  toggleMode() {
    this.isRegister = !this.isRegister;
    this.registerError = '';
    this.loginError = '';
  }

  login() {
    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (res) => {
        this.authService.saveSession(res);

        this.authService.getCurrentUser().subscribe({
          next: (user) => {
            if (user.roleId === 1) {
              this.router.navigate(['/admin/roles']);
            } else {
              this.router.navigate(['/user/tasks']);
            }
          },
          error: () => {
            this.loginError = 'Failed to fetch user profile.';
          }
        });
      },
      error: () => {
        this.loginError = 'Login failed.';
      }
    });
  }

  register() {
    this.authService.register(
      this.registerData.name,
      this.registerData.email,
      this.registerData.password
    ).subscribe({
      next: (res) => {
        this.authService.saveSession(res);

        this.authService.getCurrentUser().subscribe({
          next: (user) => {
            this.router.navigate(['/user/tasks']);
          },
          error: () => {
            this.registerError = 'Failed to fetch user profile.';
          }
        });
      },
      error: () => {
        this.registerError = 'Registration failed.';
      }
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
      return 'Name is required.';
    }

    if (!strictEmailRegex.test(email)) {
      return 'Enter a valid email address.';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    if (!passwordRegex.test(password)) {
      return 'Password must contain at least one Latin letter.';
    }

    return '';
  }

  /** Extract error message from backend response */
  private extractErrorMessage(err: any, fallback: string): string {
    const message = err?.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    return fallback;
  }
}