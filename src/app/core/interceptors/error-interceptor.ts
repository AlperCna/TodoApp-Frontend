import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
        // Eğer hata 401 ise, bu zaten authInterceptor tarafından yönetilecek, burada sadece diğer hataları ele alıyoruz
      if (error.status === 401) {
        return throwError(() => error);
      }
         // Hata mesajını varsayılan olarak belirliyoruz
      let errorMessage = 'Beklenmedik bir hata oluştu';

      // Backend'den gelen ProblemDetails yapısını okuyoruz
      if (error.error) {
        // 1. İş Kuralı Hataları (BusinessException) -> Detail alanında yazar
        if (error.error.detail) {
          errorMessage = error.error.detail;
        } 
        
        // 2. Validasyon Hataları (FluentValidation) -> Errors sözlüğündedir
        if (error.error.errors) {
          // Sözlükteki tüm hata mesajlarını birleştirip tek bir metin yapıyoruz
          const validationErrors = Object.values(error.error.errors).flat();
          errorMessage = validationErrors.join('\n'); 
        }
      }

      // Hata mesajını kullanıcıya gösteriyoruz (örneğin, alert ile)
      alert(errorMessage); 
// Konsola da detaylı hatayı yazdırıyoruz
      return throwError(() => error);
    })
  );
};