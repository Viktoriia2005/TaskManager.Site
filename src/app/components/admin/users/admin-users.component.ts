import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesService, User } from '../../../services/roles.service';
import { UsersService } from '../../../services/users.service'; // додай UsersService

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'] // виправлено styleUrl → styleUrls
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  adminName = 'admin';

  constructor(
    private rolesService: RolesService,
    private usersService: UsersService // інжектимо UsersService
  ) { }

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

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.usersService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter((u: User) => u.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete user:', err);
        }
      });
    }
  }
}
