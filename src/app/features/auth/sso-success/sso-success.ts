import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';

@Component({
  selector: 'app-sso-success',
  template: `
    <div style="text-align: center; margin-top: 50px;">
      <h2>Giriş Başarılı!</h2>
      <p>Yönlendiriliyorsunuz...</p>
    </div>
  `
})
export class SsoSuccessComponent implements OnInit {
  
  constructor(private route: ActivatedRoute, private router: Router) {}

  /**
   * Bileşen yüklendiğinde URL üzerindeki parametreleri dinlemeye başlar.
   * Google veya Microsoft gibi servislerden dönüşte tokenlar URL içinde taşınır.
   */
  ngOnInit(): void {
    // Adres çubuğundaki (URL) sorgu parametrelerini Params tipinde dinliyoruz
    this.route.queryParams.subscribe((params: Params) => {
      
      // Parametreler içinden erişim ve yenileme biletlerini (token) alıyoruz
      const accessToken: string | undefined = params['accessToken'];
      const refreshToken: string | undefined = params['refreshToken'];

      /**
       * Eğer her iki bilet de URL içinde mevcutsa, bunları tarayıcı hafızasına (LocalStorage)
       * kaydederek oturumu başlatıyoruz ve kullanıcıyı ana sayfaya yönlendiriyoruz.
       */
      if (accessToken && refreshToken) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Kimlik doğrulama işlemi tamamlandığı için kullanıcıyı görev listesine uçuruyoruz
        this.router.navigate(['/todos']);
      } else {
        /**
         * Eğer parametreler eksikse (bir hata oluşmuşsa), 
         * kullanıcıyı tekrar giriş yapması için login sayfasına geri gönderiyoruz.
         */
        this.router.navigate(['/login']);
      }
    });
  }
}