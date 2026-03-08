import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

// Tip güvenliği için domain modellerimizi içeri aktarıyoruz
import { IAuthResponse, ILoginRequest, IRegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Kullanıcı giriş bilgilerini backend'e gönderir.
   * Başarılı olursa tokenları kaydeder ve kullanıcıyı yetkisine göre yönlendirir.
   */
  login(credentials: ILoginRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (!res?.token) return;
        this.saveTokens(res.token, res.refreshToken);
        this.handleNavigation();
      })
    );
  }

  /**
   * Mevcut refresh token'ı kullanarak sunucudan yeni bir access token talep eder.
   * Genellikle 401 hatalarında interceptor üzerinden tetiklenir.
   */
  refreshToken(): Observable<IAuthResponse | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return of(null);

    return this.http.post<IAuthResponse>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap(res => {
        this.saveTokens(res.token, res.refreshToken);
      })
    );
  }

  /**
   * Kullanıcı oturumunu hem sunucu tarafında (revoke) hem de yerel hafızada sonlandırır.
   */
  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      const headers = new HttpHeaders().set('Content-Type', 'application/json');
      
      this.http.post(`${this.apiUrl}/revoke`, JSON.stringify(refreshToken), { headers })
        .subscribe({
          next: () => console.log('Sunucu tarafında oturum başarıyla sonlandırıldı.'),
          error: (err) => console.error('Revoke işlemi sırasında hata oluştu:', err),
          complete: () => this.clearLocalAndNavigate()
        });
    } else {
      this.clearLocalAndNavigate();
    }
  }

  /**
   * Tarayıcıdaki oturum verilerini temizler ve kullanıcıyı giriş sayfasına gönderir.
   */
  private clearLocalAndNavigate(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  /**
   * Sunucudan gelen token ve refresh token ikilisini yerel depolamaya (LocalStorage) yazar.
   */
  private saveTokens(token: string, refreshToken: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Kullanıcının rolüne bakar; admin ise yönetim paneline, değilse görev listesine yönlendirir.
   */
  private handleNavigation(): void {
    if (this.isAdmin()) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/todos']);
    }
  }

  /**
   * Yerel depolamadaki aktif access token'ı döndürür.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Token'ı parse ederek içindeki şirkete özel TenantId bilgisini döner.
   */
  getTenantId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.parseJwt(token);
    return payload?.['tenantId'] || null;
  }

  /**
   * Mevcut tüm şirketlerin (Tenants) listesini asenkron olarak çeker.
   */
  getTenants(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tenants`);
  }

  /**
   * JWT formatındaki token'ın payload kısmını base64'ten çözerek okunabilir nesneye çevirir.
   */
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  /**
   * Token içindeki standart veya Microsoft tabanlı rol claim'lerini kontrol ederek kullanıcı rolünü döner.
   */
  getRole(): string | string[] | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.parseJwt(token);
    return payload?.['role'] || 
           payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
           payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] || 
           null;
  }

  /**
   * Kullanıcının 'Admin' rolüne sahip olup olmadığını mekanik olarak kontrol eder.
   */
  isAdmin(): boolean {
    const role = this.getRole();
    if (Array.isArray(role)) {
      return role.some(r => r.toLowerCase() === 'admin');
    }
    return role?.toLowerCase() === 'admin';
  }

  /**
   * Sistemde geçerli bir token olup olmadığını (oturumu) kontrol eder.
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Yeni kullanıcı kayıt verilerini backend'e iletir.
   */
  register(userData: IRegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
}