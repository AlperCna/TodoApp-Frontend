import { Routes } from '@angular/router';
// Bileşenleri (Component) içe aktarıyoruz - Uzantı (.ts) yazmıyoruz!
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { TodoList } from './features/todos/todo-list/todo-list';
import { AdminPage } from './features/admin/admin-page'; // Senin verdiğin yeni yol
// Guard'ları içe aktarıyoruz
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard'; // Senin verdiğin yeni yol

export const routes: Routes = [
  // 1. Orijinal sayfaların ve senin kendi isimlendirmelerin
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'todos', component: TodoList, canActivate: [authGuard] },
  
  // 2. Admin Paneli - Kendi Guard'ı ile korunuyor
  { path: 'admin', component: AdminPage, canActivate: [adminGuard] },

  // 3. Varsayılan yönlendirme - Uygulama açılınca doğrudan Login'e gider
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];