import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { TodoList } from './features/todos/todo-list/todo-list';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'todos', component: TodoList, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];