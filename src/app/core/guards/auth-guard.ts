import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    return true; // Geçebilirsin
  } else {
    router.navigate(['/login']); // Giriş yapmamış, içeri alma
    return false;
  }
};