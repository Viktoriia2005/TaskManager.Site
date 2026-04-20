// English: Material-based roles component with mat-table, mat-menu and MatDialog
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { RolesService, User, Role } from '../../../services/roles.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatRadioModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule
  ],
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.scss']
})
export class AdminRolesComponent implements OnInit {
  // English: table data and columns
  displayedColumns: string[] = ['name', 'role'];
  dataSource = new MatTableDataSource<User>([]);
  @ViewChild(MatSort) sort!: MatSort;

  // English: roles list
  roles: Role[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' }
  ];

  // English: UI state
  users: User[] = [];
  adminName: string | null = null;

  // English: active user for menu and dialogs
  activeUser: User | null = null;

  // English: dialog templates refs
  @ViewChild('editDialog') editDialogTpl!: TemplateRef<any>;
  @ViewChild('deleteDialog') deleteDialogTpl!: TemplateRef<any>;
  dialogRef: MatDialogRef<any> | null = null;

  // English: temporary role id used in edit dialog
  editRoleId: number | null = null;

  constructor(
    private rolesService: RolesService,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadAdminName();
  }

  ngAfterViewInit(): void {
    // English: attach sort after view init
    this.dataSource.sort = this.sort;
  }

  // English: load users from service
  loadUsers(): void {
    this.rolesService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        this.dataSource.data = data;
      },
      error: (err: any) => console.error('Failed to load users:', err)
    });
  }

  // English: load admin name from profile
  loadAdminName(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.adminName = user.name;
      },
      error: (err) => {
        console.error('Failed to load admin name:', err);
        this.adminName = null;
      }
    });
  }

  // English: set active user when opening row menu
  setActiveUser(user: User, event: MouseEvent): void {
    event.stopPropagation();
    this.activeUser = user;
  }

  // English: open edit dialog (from menu or double click)
  openEditDialog(user: User | null): void {
    if (!user) return;
    this.activeUser = user;
    this.editRoleId = user.roleId;
    this.dialogRef = this.dialog.open(this.editDialogTpl, {
      data: { ...user },
      width: '320px'
    });
  }

  // English: save role changes
  saveRole(): void {
    if (!this.activeUser || this.editRoleId == null) return;
    const id = this.activeUser.id;
    const newRoleId = this.editRoleId;
    this.rolesService.updateUserRole(id, newRoleId).subscribe({
      next: (updatedUser: User) => {
        const idx = this.users.findIndex(u => u.id === updatedUser.id);
        if (idx !== -1) {
          this.users[idx] = updatedUser;
          this.dataSource.data = [...this.users];
        }
        this.dialogRef?.close();
        this.activeUser = null;
      },
      error: (err: any) => console.error('Failed to update user role:', err)
    });
  }

  // English: open delete confirmation dialog
  openDeleteDialog(user: User | null): void {
    if (!user) return;
    this.activeUser = user;
    this.dialogRef = this.dialog.open(this.deleteDialogTpl, {
      data: { ...user },
      width: '320px'
    });
  }

  // English: confirm deletion
  deleteUserConfirmed(): void {
    if (!this.activeUser) return;
    const id = this.activeUser.id;
    this.rolesService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== id);
        this.dataSource.data = [...this.users];
        this.dialogRef?.close();
        this.activeUser = null;
      },
      error: (err: any) => console.error('Failed to delete user:', err)
    });
  }

  // English: helper to get role name
  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  }
}