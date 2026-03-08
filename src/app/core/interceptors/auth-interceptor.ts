import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth'; // AuthService'i içe aktarın
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // İsteklere mevcut Access Token'ı ekle
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // 2Hata takibi ve 401 (Unauthorized) yönetimi
  return next(authReq).pipe(
    catchError((error) => {
      // Eğer hata 401 ise ve bu bir login isteği değilse sessiz yenilemeyi başlat
      if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('login')) {
          /// Oturum süresi dolmuş olabilir. Sessiz yenileme yapmayı dene.
        console.warn('⚠️ Access Token süresi dolmuş. Sessiz yenileme deneniyor...');
// AuthService içindeki refreshToken metodunu çağırarak yeni token almaya çalışıyoruz. Bu metod, eğer refresh token geçerliyse yeni bir access token dönecektir.
        return authService.refreshToken().pipe(
          switchMap((res) => {
            if (res && res.token) {
              console.log('✅ Token başarıyla tazelendi. İstek tekrarlanıyor...');

              // Yenileme başarılı! Orijinal isteği yeni token ile klonla ve tekrar gönder
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.token}` }
              });

              return next(retryReq);
            }

            // Eğer yenileme sonucu token gelmezse (session bitmişse)
            authService.logout();
            return throwError(() => error);
          }),
          catchError((refreshErr) => {
            // Refresh Token'ın süresi dolmuşsa veya hata verirse kullanıcıyı dışarı at
            console.error(' Oturum süresi tamamen dolmuş. Giriş sayfasına yönlendiriliyor.');
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }

      // 401 dışındaki diğer tüm hataları olduğu gibi ilet
      return throwError(() => error);
    })
  );
};