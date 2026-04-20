import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

// Material imports for standalone component
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  // English: import RouterModule and Material modules so template directives work
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  // English: display admin name in the toolbar
  adminName: string = 'admin';

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    // English: fetch current user profile and set admin name
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.adminName = user.name || 'admin';
      },
      error: (err) => {
        console.error('Failed to load admin name:', err);
        this.adminName = 'admin';
      }
    });
  }

  // English: navigate to admin child routes
  navigate(path: string): void {
    this.router.navigate([`/admin/${path}`]);
  }

  // English: logout and redirect to auth page
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}