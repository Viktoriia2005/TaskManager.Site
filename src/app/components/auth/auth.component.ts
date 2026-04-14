import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  ) {}

  toggleMode() {
    this.isRegister = !this.isRegister;
    this.registerError = '';
    this.loginError = '';
  }

  login() {
    this.loginError = '';

    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (res) => {
        console.log('Login response:', res);
        console.log('User roleId:', res.user.roleId);
        
        this.authService.saveSession(res);
        
        // Перенаправити залежно від ролі
        const user = res.user;
        if (user.roleId === 1) {
          // Administrator
          console.log('Redirecting to admin');
          this.router.navigate(['/admin/roles']);
        } else {
          // Regular user
          console.log('Redirecting to user tasks');
          this.router.navigate(['/user/tasks']);
        }
      },
      error: (err) => {
        this.loginError = this.extractErrorMessage(err, 'Login failed.');
        console.error('Login error:', err);
      }
    });
  }

  register() {
    this.registerError = this.validateRegisterForm();
    if (this.registerError) {
      return;
    }

    this.authService.register(
      this.registerData.name,
      this.registerData.email,
      this.registerData.password
    ).subscribe({
      next: (res) => {
        this.authService.saveSession(res);
        // Новий користувач завжди отримує роль User (roleId = 2)
        this.router.navigate(['/user/tasks']);
      },
      error: (err) => {
        this.registerError = this.extractErrorMessage(err, 'Registration failed.');
        console.error('Register error:', err);
      }
    });
  }

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
