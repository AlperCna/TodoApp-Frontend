import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1. Kural: Giriş yapılmamışsa login sayfasına gönder
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Kural: Admin İzolasyonu
  // Eğer kullanıcı Admin ise ve /todos sayfasına (veya alt kırılımlarına) gitmeye çalışıyorsa,
  // onu hemen /admin paneline geri döndür.
  if (auth.isAdmin() && state.url.includes('/todos')) {
    console.warn('Erişim Engellendi: Admin kullanıcı Todo sayfasına giremez.');
    router.navigate(['/admin']);
    return false;
  }

  // Her şey yolundaysa (User -> /todos veya Admin -> /admin durumu) geçişe izin ver
  return true;
};