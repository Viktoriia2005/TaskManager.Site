import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

/**
 * Guard for admin routes.
 * Allows access only if user roleId === 1 (admin).
 */
export const roleAdminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if token exists
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth']);
    return of(false);
  }

  return authService.getCurrentUser().pipe(
    map(res => {
      const user = res?.user;
      if (user && user.roleId === 1) {
        return true;
      }
      router.navigate(['/user/tasks']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/auth']);
      return of(false);
    })
  );
};

/**
 * Guard for user routes.
 * Allows access only if user roleId !== 1 (not admin).
 */
export const roleUserGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if token exists
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth']);
    return of(false);
  }

  return authService.getCurrentUser().pipe(
    map(res => {
      const user = res?.user;
      if (user && user.roleId !== 1) {
        return true;
      }
      router.navigate(['/auth']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/auth']);
      return of(false);
    })
  );
};