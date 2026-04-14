import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesService, User } from '../../../services/roles.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
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

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      // TODO: Implement deleteUser method in UsersService
      console.log('Delete user:', userId);
    }
  }
}
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.usersService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete user:', err);
        }
      });
    }
  }
}
