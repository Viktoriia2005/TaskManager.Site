import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { TranslationService } from '../../../i18n/translation.service';
import { Role, RolesService, User } from '../../../services/roles.service';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatRadioModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    TranslatePipe,
  ],
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.scss'],
})
export class AdminRolesComponent implements OnInit {
  displayedColumns: string[] = ['name', 'role'];
  dataSource = new MatTableDataSource<User>([]);
  @ViewChild(MatSort) sort!: MatSort;

  roles: Role[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
  ];

  users: User[] = [];
  activeUser: User | null = null;

  @ViewChild('editDialog') editDialogTpl!: TemplateRef<any>;
  @ViewChild('deleteDialog') deleteDialogTpl!: TemplateRef<any>;
  dialogRef: MatDialogRef<any> | null = null;

  editRoleId: number | null = null;

  constructor(
    private readonly rolesService: RolesService,
    private readonly dialog: MatDialog,
    public readonly translationService: TranslationService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.rolesService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        this.dataSource.data = data;
      },
      error: (err) =>
        console.error(this.translationService.t('error.loadUsers'), err),
    });
  }

  setActiveUser(user: User, event: MouseEvent): void {
    event.stopPropagation();
    this.activeUser = user;
  }

  openEditDialog(user: User | null): void {
    if (!user) return;
    this.activeUser = user;
    this.editRoleId = user.roleId;
    this.dialogRef = this.dialog.open(this.editDialogTpl, {
      data: { ...user },
      width: '320px',
    });
  }

  saveRole(): void {
    if (!this.activeUser || this.editRoleId == null) return;
    const id = this.activeUser.id;
    const newRoleId = this.editRoleId;
    this.rolesService.updateUserRole(id, newRoleId).subscribe({
      next: (updatedUser: User) => {
        const idx = this.users.findIndex((u) => u.id === updatedUser.id);
        if (idx !== -1) {
          this.users[idx] = updatedUser;
          this.dataSource.data = [...this.users];
        }
        this.dialogRef?.close();
        this.activeUser = null;
      },
      error: (err) =>
        console.error(this.translationService.t('error.updateRole'), err),
    });
  }

  openDeleteDialog(user: User | null): void {
    if (!user) return;
    this.activeUser = user;
    this.dialogRef = this.dialog.open(this.deleteDialogTpl, {
      data: { ...user },
      width: '320px',
    });
  }

  deleteUserConfirmed(): void {
    if (!this.activeUser) return;
    const id = this.activeUser.id;
    this.rolesService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== id);
        this.dataSource.data = [...this.users];
        this.dialogRef?.close();
        this.activeUser = null;
      },
      error: (err) =>
        console.error(this.translationService.t('error.deleteUser'), err),
    });
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find((item) => item.id === roleId);
    return role
      ? this.translationService.translateRole(role.name)
      : this.translationService.t('admin.roles.unknown');
  }

  getRoleLabel(role: Role): string {
    return this.translationService.translateRole(role.name);
  }
}
