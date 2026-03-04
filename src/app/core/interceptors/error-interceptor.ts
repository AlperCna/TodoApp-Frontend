import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // 401 hatasını sessizce pas geçiyoruz (AuthInterceptor halledecek)
      if (error.status === 401) {
        return throwError(() => error);
      }

      let errorMessage = 'Beklenmedik bir hata oluştu';

      // 🚀 Backend'den gelen ProblemDetails yapısını okuyoruz
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

      // Hocanın istediği: Kullanıcıya hatayı göster!
      // İleride buraya 'alert' yerine güzel bir Toast mesajı koyabilirsin.
      alert(errorMessage); 

      return throwError(() => error);
    })
  );
};