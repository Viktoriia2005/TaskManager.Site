import { Routes } from '@angular/router';

/* Components */
import { AuthComponent } from './components/auth/auth.component';
import { AdminLayoutComponent } from './components/admin/layout/admin-layout.component';
import { AdminRolesComponent } from './components/admin/roles/admin-roles.component';
import { AdminCategoriesComponent } from './components/admin/categories/admin-categories.component';
import { AdminTasksComponent } from './components/admin/tasks/admin-tasks.component';
import { UserTasksComponent } from './components/user/tasks/user-tasks.component';
import { UserTaskFormComponent } from './components/user/task-form/user-task-form.component';

/* Guards */
import { authPageGuard, userPageGuard } from './guards/auth.guards';
import { roleAdminGuard, roleUserGuard } from './guards/role.guards';

/**
 * Application routes configuration
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'user/tasks' },
  { path: 'auth', component: AuthComponent, canActivate: [authPageGuard] },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [roleAdminGuard],
    children: [
      { path: 'roles', component: AdminRolesComponent },
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'tasks', component: AdminTasksComponent },
      { path: '', redirectTo: 'roles', pathMatch: 'full' },
    ],
  },

  {
    path: 'user',
    canActivate: [userPageGuard, roleUserGuard],
    children: [
      { path: 'tasks', component: UserTasksComponent },
      { path: 'tasks/new', component: UserTaskFormComponent },
      { path: 'tasks/:id/edit', component: UserTaskFormComponent },
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
    ],
  },

  { path: 'tasks', redirectTo: 'user/tasks' },
  { path: 'tasks/new', redirectTo: 'user/tasks/new' },
  { path: 'tasks/:id/edit', redirectTo: 'user/tasks/:id/edit' },
  { path: '**', redirectTo: 'user/tasks' },
];