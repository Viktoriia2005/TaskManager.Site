import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService, User, Role } from '../../../services/roles.service';
import { AuthService } from '../../../services/auth.service'; // додай AuthService

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.scss'] // виправлено styleUrl → styleUrls
})
export class AdminRolesComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' }
  ];

  showRoleModal = false;
  selectedUser: User | null = null;
  adminName: string | null = null; // тепер динамічне значення

  constructor(
    private rolesService: RolesService,
    private authService: AuthService // інжектуємо AuthService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadAdminName();
  }

  loadUsers(): void {
    this.rolesService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
  }

  loadAdminName(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.adminName = currentUser.name; // підтягнути ім’я з таблиці users
    }
  }

  editRole(user: User): void {
    this.selectedUser = { ...user };
    this.showRoleModal = true;
  }

  saveRole(): void {
    if (this.selectedUser) {
      this.rolesService.updateUserRole(this.selectedUser.id, this.selectedUser.roleId).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.cancel();
        },
        error: (err) => {
          console.error('Failed to update user role:', err);
        }
      });
    }
  }

  cancel(): void {
    this.showRoleModal = false;
    this.selectedUser = null;
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  }
}
