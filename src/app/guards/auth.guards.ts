import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of, switchMap } from 'rxjs';

/**
 * Guard for authenticated users (any role)
 */
export const userPageGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getToken()) {
    return router.createUrlTree(['/auth']);
  }

  // Always validate user via backend (NOT only localStorage)
  return authService.getCurrentUser().pipe(
    map(res => {
      if (res?.user) return true;
      return router.createUrlTree(['/auth']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/auth']));
    })
  );
};

/**
 * Guard for ADMIN ONLY
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getToken()) {
    return true;
  }

  return authService.getCurrentUser().pipe(
    map(res => {
      const user = res?.user;

      if (user?.roleId === 1) {
        return router.createUrlTree(['/admin/roles']);
      }

      return router.createUrlTree(['/user/tasks']);
    }),
    catchError(() => {
      authService.logout();
      return of(true);
    })
  );
};
