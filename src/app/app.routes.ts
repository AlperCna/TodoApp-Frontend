import { Routes } from '@angular/router';
// Bileşenleri (Component) içe aktarıyoruz
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { TodoList } from './features/todos/todo-list/todo-list';
import { AdminPage } from './features/admin/admin-page';
import { SsoSuccessComponent } from './features/auth/sso-success/sso-success'; // Yeni eklendi
// Guard'ları içe aktarıyoruz
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  // 1. Orijinal sayfaların ve SSO Başarı sayfası
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'sso-success', component: SsoSuccessComponent }, // SSO dönüş adresi
  { path: 'todos', component: TodoList, canActivate: [authGuard] },
  
  // 2. Admin Paneli - Kendi Guard'ı ile korunuyor
  { path: 'admin', component: AdminPage, canActivate: [adminGuard] },

  // 3. Varsayılan yönlendirme - Uygulama açılınca doğrudan Login'e gider
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];