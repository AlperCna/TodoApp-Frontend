import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth'; 
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAdmin()) {
    console.warn('Erişim reddedildi: Admin yetkisi gerekli!');
    router.navigate(['/todos']);
    return false;
  }
  return true;
};