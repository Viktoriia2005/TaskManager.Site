import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService, User, Role } from '../../../services/roles.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.scss']
})
export class AdminRolesComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' }
  ];

  showRoleModal = false;
  selectedUser: User | null = null;
  adminName: string | null = null;

  activeUser: User | null = null;
  menuPosition = { top: 0, left: 0 };

  constructor(
    private rolesService: RolesService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadAdminName();

    document.addEventListener('click', () => {
      this.activeUser = null;
    });
  }

  loadUsers(): void {
    this.rolesService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (err: any) => {
        console.error('Failed to load users:', err);
      }
    });
  }

  loadAdminName(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.adminName = currentUser.name;
    }
  }

  toggleMenu(user: User, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeUser && this.activeUser.id === user.id) {
      this.activeUser = null;
    } else {
      this.activeUser = user;
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      this.menuPosition = {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      };
    }
  }

  editRole(user: User): void {
    this.selectedUser = { ...user };
    this.showRoleModal = true;
    this.activeUser = null;
  }

  saveRole(): void {
    if (this.selectedUser) {
      this.rolesService.updateUserRole(this.selectedUser.id, this.selectedUser.roleId).subscribe({
        next: (updatedUser: User) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.cancel();
        },
        error: (err: any) => {
          console.error('Failed to update user role:', err);
        }
      });
    }
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.rolesService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
          this.activeUser = null;
        },
        error: (err: any) => {
          console.error('Failed to delete user:', err);
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
