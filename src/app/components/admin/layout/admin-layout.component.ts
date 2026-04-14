import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  adminName = 'admin';

  constructor(private router: Router, private authService: AuthService) {
    this.adminName = this.authService.getCurrentUser()?.name || 'admin';
  }

  navigate(path: string): void {
    this.router.navigate([`/admin/${path}`]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
