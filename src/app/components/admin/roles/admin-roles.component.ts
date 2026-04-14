import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService, User, Role } from '../../../services/roles.service';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-roles.component.html',
  styleUrl: './admin-roles.component.scss'
})
export class AdminRolesComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' }
  ];
  
  showRoleModal = false;
  selectedUser: User | null = null;
  adminName = 'admin';

  constructor(private rolesService: RolesService) { }

  ngOnInit(): void {
    this.loadUsers();
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
