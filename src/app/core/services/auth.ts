import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs'; // 'of' eklendi
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

        // Sadece token değil, refreshToken'ı da kaydediyoruz
        this.saveTokens(res.token, res.refreshToken);

        if (this.isAdmin()) {
          console.log('✅ Admin girişi başarılı, panele gidiliyor...');
          this.router.navigate(['/admin']);
        } else {
          console.log('ℹ️ Kullanıcı girişi başarılı, görevlere gidiliyor...');
          this.router.navigate(['/todos']);
        }
      })
    );
  }

  //  Backend'den yeni bir Access Token isteyen sessiz yenileme metodu
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return of(null);

    return this.http.post<any>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap(res => {
        // Yenileme başarılıysa yeni token çiftini kaydediyoruz
        this.saveTokens(res.token, res.refreshToken);
      })
    );
  }

  // ✅ YENİ: Token'ları yerel hafızaya kaydeden yardımcı metod
  private saveTokens(token: string, refreshToken: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken); //
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken'); //EKLEME: Refresh token'ı da temizliyoruz
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  // Token içindeki TenantId bilgisini döner
  getTenantId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.parseJwt(token);
    if (!payload) return null;

    return payload['tenantId'] || null;
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
    if (!payload) return null;

    return (
      payload['role'] || 
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] ||
      null
    );
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
}