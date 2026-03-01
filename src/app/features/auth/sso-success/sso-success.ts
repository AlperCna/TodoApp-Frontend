import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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

  ngOnInit(): void {
    // URL'deki query parametrelerini okuyoruz
    this.route.queryParams.subscribe(params => {
      const accessToken = params['accessToken'];
      const refreshToken = params['refreshToken'];

      if (accessToken && refreshToken) {
        // Backend'den gelen tokenları LocalStorage'a kaydediyoruz
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Kullanıcıyı direkt Todo listesine uçuruyoruz
        this.router.navigate(['/todos']);
      } else {
        // Parametreler eksikse hata verip login'e gönderiyoruz
        this.router.navigate(['/login']);
      }
    });
  }
}