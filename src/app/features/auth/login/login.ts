import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // RouterModule burada olmalı
import { AuthService } from '../../../core/services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule], 
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginData = { email: '', password: '' };

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.auth.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Giriş başarılı!', response);
        this.router.navigate(['/todos']); // Giriş başarılıysa listeye git
      },
      error: (err) => {
        alert('Giriş başarısız! Bilgilerini kontrol et.');
        console.error(err);
      }
    });
  }
}