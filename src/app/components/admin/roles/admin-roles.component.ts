import { Component, OnInit, HostListener } from '@angular/core';
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
  // List of users
  users: User[] = [];

  // Available roles
  roles: Role[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' }
  ];

  // Modal states
  showRoleModal = false;
  showDeleteModal = false;

  // Selected user for editing/deleting
  selectedUser: User | null = null;

  // Current admin name
  adminName: string | null = null;

  // Context menu state
  activeUser: User | null = null;
  menuPosition = { top: 0, left: 0 };

  constructor(
    private rolesService: RolesService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadAdminName();
  }

  // Load all users
  loadUsers(): void {
    this.rolesService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (err: any) => console.error('Failed to load users:', err)
    });
  }

  // Load current admin name
  loadAdminName(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.adminName = currentUser.name;
    }
  }

  // Toggle context menu
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

  // Open edit modal (from menu or double click)
  editRole(user: User): void {
    this.selectedUser = { ...user };
    this.showRoleModal = true;
    this.activeUser = null;
  }

  // Save role changes
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
        error: (err: any) => console.error('Failed to update user role:', err)
      });
    }
  }

  // Open delete confirmation modal
  confirmDelete(user: User): void {
    this.selectedUser = { ...user };
    this.showDeleteModal = true;
    this.activeUser = null;
  }

  // Delete user after confirmation
  deleteUserConfirmed(): void {
    if (this.selectedUser) {
      this.rolesService.deleteUser(this.selectedUser.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== this.selectedUser!.id);
          this.cancelDelete();
        },
        error: (err: any) => console.error('Failed to delete user:', err)
      });
    }
  }

  // Cancel edit modal
  cancel(): void {
    this.showRoleModal = false;
    this.selectedUser = null;
  }

  // Cancel delete modal
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  // Get role name by ID
  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  }

  // Close menus when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-btn') && !target.closest('.dropdown-menu')) {
      this.activeUser = null;
    }
  }
}
