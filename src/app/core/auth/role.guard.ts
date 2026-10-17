import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import type { Role } from '../models/user.model';
import { AuthService } from './auth.service';

export function roleGuard(roles: readonly Role[]): CanActivateFn {
  return () => {
    const user = inject(AuthService).user();
    if (user && roles.includes(user.role)) {
      return true;
    }
    return inject(Router).createUrlTree(['/shipments']);
  };
}
