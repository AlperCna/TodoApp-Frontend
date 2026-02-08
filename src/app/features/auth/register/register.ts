import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  // username alanını ekledik
  registerData = { 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  };

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    // 1. Şifre kontrolü
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Şifreler uyuşmuyor!');
      return;
    }

    // 2. Backend'in beklediği tam model
    const payload = {
      username: this.registerData.username,
      email: this.registerData.email,
      password: this.registerData.password
    };

    
    this.auth.register(payload).subscribe({
      next: () => {
        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Kayıt Hatası Detayı:', err);
        // Hata detayını kullanıcıya gösterelim
        alert('Kayıt sırasında bir sorun oluştu. Şifrenizin en az 6 karakter, 1 rakam ve 1 büyük harf içerdiğinden emin olun.');
      }
    });
  }
}