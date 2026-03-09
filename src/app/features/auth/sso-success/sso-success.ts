import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';

@Component({
  selector: 'app-sso-success',
  standalone: true,
  template: `
    <div style="text-align: center; margin-top: 50px;">
      <h2>Giriş Başarılı!</h2>
      <p>Yönlendiriliyorsunuz...</p>
    </div>
  `,
  /* ChangeDetectionStrategy.OnPush: Bu bileşen sadece bir geçiş köprüsü (bridge) 
     olduğu için herhangi bir UI güncelleme döngüsüne ihtiyaç duymaz. 
     OnPush ile uygulamanın bu aşamada tamamen statik ve performanslı kalması sağlanır.
  */
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SsoSuccessComponent implements OnInit {
  
  constructor(private route: ActivatedRoute, private router: Router) {}

  /**
   * Bileşen lifecycle başlangıcında URL parametrelerini reaktif olarak dinler.
   * OAuth2 akışından dönen kimlik bilgilerini (token) ayıklayarak kalıcı hafızaya aktarır.
   */
  ngOnInit(): void {
    /* ActivatedRoute queryParams bir Observable akışıdır. 
       OnPush stratejisinde bile bu akış tetiklendiğinde yönlendirme (navigation) 
       mekanik olarak gerçekleşecektir.
    */
    this.route.queryParams.subscribe((params: Params) => {
      
      const accessToken: string | undefined = params['accessToken'];
      const refreshToken: string | undefined = params['refreshToken'];

      /**
       * State Management: Gelen biletler LocalStorage katmanına mühürlenir.
       * Bu işlemden sonra router üzerinden güvenli alana (Internal Zone) geçiş yapılır.
       */
      if (accessToken && refreshToken) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        this.router.navigate(['/todos']);
      } else {
        /* Hatalı veya eksik parametre durumunda giriş başarısız sayılır 
           ve kullanıcı kimlik doğrulama ekranına geri postalanır.
        */
        this.router.navigate(['/login']);
      }
    });
  }
}