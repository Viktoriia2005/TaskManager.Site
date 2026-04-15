import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { AdminLayoutComponent } from './components/admin/layout/admin-layout.component';
import { AdminRolesComponent } from './components/admin/roles/admin-roles.component';
import { AdminCategoriesComponent } from './components/admin/categories/admin-categories.component';
import { AdminTasksComponent } from './components/admin/tasks/admin-tasks.component'; // ← правильний імпорт
import { UserTasksComponent } from './components/user/tasks/user-tasks.component';
import { UserTaskFormComponent } from './components/user/task-form/user-task-form.component';
import { authPageGuard, userPageGuard } from './guards/auth.guards';
import { roleAdminGuard, roleUserGuard } from './guards/role.guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'user/tasks',
  },
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [authPageGuard],
  },

  // ===== ADMIN ROUTES =====
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [userPageGuard, roleAdminGuard],
    children: [
      {
        path: 'roles',
        component: AdminRolesComponent,
      },
      {
        path: 'categories',
        component: AdminCategoriesComponent,
      },
      {
        path: 'tasks', // ← тепер правильний шлях
        component: AdminTasksComponent, // ← правильний компонент
      },
      {
        path: '',
        redirectTo: 'roles',
        pathMatch: 'full',
      },
    ],
  },

  // ===== USER ROUTES =====
  {
    path: 'user',
    canActivate: [userPageGuard, roleUserGuard],
    children: [
      {
        path: 'tasks',
        component: UserTasksComponent,
      },
      {
        path: 'tasks/new',
        component: UserTaskFormComponent,
      },
      {
        path: 'tasks/:id/edit',
        component: UserTaskFormComponent,
      },
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full',
      },
    ],
  },

  // Legacy redirects (залишаємо тільки для user)
  {
    path: 'tasks',
    redirectTo: 'user/tasks',
  },
  {
    path: 'tasks/new',
    redirectTo: 'user/tasks/new',
  },
  {
    path: 'tasks/:id/edit',
    redirectTo: 'user/tasks/:id/edit',
  },

  {
    path: '**',
    redirectTo: 'user/tasks',
  },
];
