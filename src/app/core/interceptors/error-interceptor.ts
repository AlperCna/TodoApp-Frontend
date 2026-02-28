import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // 401 hatasını sessizce pas geçiyoruz.
      // Çünkü authInterceptor bu hatayı yakalayıp sessizce yenileme (Silent Refresh) yapacak.
      if (error.status === 401) {
        return throwError(() => error);
      }

      let errorMessage = 'Beklenmedik bir hata oluştu';

      if (error.status === 400) {
        //DTO Validation hatalarını yakalar (Karakter sınırı vb.)
        errorMessage = error.error?.message || 'Geçersiz veri girişi yapıldı';
        console.error('Validation Hatası:', error.error);
      } 
      else if (error.status === 500) {
        // Backend'deki patlamaları (Exception) yakalar
        errorMessage = 'Sunucu tarafında bir hata oluştu';
      }
      else {
        // Diğer hata durumları için backend'den gelen mesajı kullanmaya çalış
        errorMessage = error.error?.message || errorMessage;
      }

      // 401 dışındaki tüm gerçek hatalar için uyarıyı göster
      alert(errorMessage); 

      return throwError(() => error);
    })
  );
};