import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleAdminGuard = (route: any, state: any) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = authService.getCurrentUser();
  
  // Check if user is admin (roleId 1 or role 'admin')
  const isAdmin = user && (user.roleId === 1 || user.role === 'admin');
  
  if (!isAdmin) {
    router.navigate(['/user/tasks']);
    return false;
  }
  
  return true;
};

export const roleUserGuard = (route: any, state: any) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = authService.getCurrentUser();
  
  // Check if user exists
  if (!user) {
    router.navigate(['/auth']);
    return false;
  }
  
  return true;
};
