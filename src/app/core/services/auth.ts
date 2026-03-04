import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (!res?.token) return;
        this.saveTokens(res.token, res.refreshToken);
        this.handleNavigation();
      })
    );
  }

  // ✅ YENİ: Token Yenileme (Refresh)
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return of(null);

    return this.http.post<any>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap(res => {
        this.saveTokens(res.token, res.refreshToken);
      })
    );
  }

  // 🛡️ GÜNCELLENDİ: Revoke (Logout) Mantığı
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

  // Yardımcı Metod: Yerel veriyi temizle ve yönlendir
  private clearLocalAndNavigate() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    console.log('ℹ️ Yerel oturum verileri temizlendi.');
    this.router.navigate(['/login']);
  }

  private saveTokens(token: string, refreshToken: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

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

  getTenantId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.parseJwt(token);
    return payload?.['tenantId'] || null;
  }

  getTenants(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tenants`);
  }

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

  getRole(): any {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.parseJwt(token);
    return payload?.['role'] || 
           payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
           payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] || 
           null;
  }

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