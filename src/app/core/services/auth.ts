import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
// AuthService, kullanıcı kimlik doğrulaması, token yönetimi ve oturum kontrolü gibi tüm işlemleri yönetecek
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient, private router: Router) {}
// Login metodunda artık sadece token alma değil, aynı zamanda token'ları kaydetme ve kullanıcıyı yönlendirme işlemleri de var
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (!res?.token) return;
        this.saveTokens(res.token, res.refreshToken);
        this.handleNavigation();
      })
    );
  }

  // Oturum süresi dolduğunda veya token geçersiz olduğunda yeni token almak için refresh token'ı kullanarak backend'e istek atan metod
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return of(null);

    return this.http.post<any>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap(res => {
        this.saveTokens(res.token, res.refreshToken);
      })
    );
  }

  // Kullanıcıyı tamamen oturumdan çıkarmak için metod. Hem yerel veriyi temizler hem de backend'e revoke isteği gönderir.
  logout() {
    const refreshToken = localStorage.getItem('refreshToken');

    // Eğer bir refresh token varsa, backend'e "bu oturumu veritabanında öldür" diyoruz
    if (refreshToken) {
      // Refresh token bir string olduğu için JSON formatında gönderiyoruz
      const headers = new HttpHeaders().set('Content-Type', 'application/json');
      
      this.http.post(`${this.apiUrl}/revoke`, JSON.stringify(refreshToken), { headers })
        .subscribe({
          next: () => console.log('✅ Sunucu tarafında oturum sonlandırıldı (Revoked).'),
          error: (err) => console.error('❌ Revoke işlemi başarısız:', err),
          complete: () => this.clearLocalAndNavigate() // Hata olsa bile tarayıcıyı temizle
        });
    } else {
      this.clearLocalAndNavigate();
    }
  }

  // Oturum verilerini temizleyen ve kullanıcıyı login sayfasına yönlendiren yardımcı metod
  private clearLocalAndNavigate() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    console.log('ℹ️ Yerel oturum verileri temizlendi.');
    this.router.navigate(['/login']);
  }
// Login, logout ve token yenileme işlemlerinin yanı sıra, token içeriğinden kullanıcı rolü ve tenant bilgisi çekme gibi yardımcı metotlar da burada yer alacak
  private saveTokens(token: string, refreshToken: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }
// Kullanıcı giriş yaptıktan sonra, eğer admin ise admin paneline, değilse todo listesine yönlendirmek için metod
  private handleNavigation() {
    if (this.isAdmin()) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/todos']);
    }
  }

  // --- Yardımcı Metotlar (Token Parse, Role Kontrol vb.) ---

  getToken() {
    return localStorage.getItem('token');
  }
// Token içinden tenantId'yi çekmek için metod Bu metod, token'ı decode ederek içindeki payload'dan tenantId'yi alır. Eğer token yoksa veya parse işlemi başarısız olursa null döner.
  getTenantId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.parseJwt(token);
    return payload?.['tenantId'] || null;
  }
// Backend'deki Tenants'ı çekmek için metod Bu metod, backend'deki Tenants endpoint'ine istek atarak mevcut tenant listesini çeker. Bu liste, login sayfasındaki tenant seçimi için kullanılacak.
  getTenants(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tenants`);
  }
// JWT token'ı decode ederek içindeki bilgileri çekmek için yardımcı metod. Bu metod, token'ın payload kısmını base64'ten decode eder ve JSON formatında geri döner. Eğer token geçersizse veya parse işlemi sırasında hata oluşursa null döner.
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
// Token içinden kullanıcı rolünü çekmek için metod Bu metod, token'ı parse ederek içindeki payload'dan role bilgisini alır. Farklı claim isimlendirmeleri olabileceği için birkaç farklı anahtar kontrol edilir. Eğer rol bilgisi yoksa null döner.
  getRole(): any {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.parseJwt(token);
    return payload?.['role'] || 
           payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
           payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] || 
           null;
  }
// Kullanıcının admin olup olmadığını kontrol eden metod Bu metod, getRole() ile çekilen rol bilgisini kontrol eder. Eğer rol bir dizi ise içinde 'admin' olup olmadığına bakar. Eğer tek bir string ise direkt olarak 'admin' ile karşılaştırır. Sonuç olarak kullanıcı admin ise true, değilse false döner.
  isAdmin(): boolean {
    const role = this.getRole();
    if (Array.isArray(role)) {
      return role.some(r => r.toLowerCase() === 'admin');
    }
    return role?.toLowerCase() === 'admin';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
}