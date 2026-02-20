import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

// ✅ NG-ZORRO Modülleri
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [NzMessageService]
})
export class Login {
  validateForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private message: NzMessageService
  ) {
    // Backend tam olarak hangi isimleri bekliyorsa onu yazıyoruz (genelde email ve password)
    this.validateForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]]
    });
  }

  onLogin(): void {
    if (this.validateForm.valid) {
      // ✅ Form verilerini tek paket olarak alıyoruz
      const payload = this.validateForm.value;
      console.log('Giriş isteği gönderiliyor:', payload);

      this.auth.login(payload).subscribe({
        next: (response) => {
          this.message.success('Giriş başarılı! Hoş geldiniz.');
          this.router.navigate(['/todos']); // Giriş sonrası gidilecek sayfa
        },
        error: (err) => {
          console.error('Giriş Hatası:', err);
          // 401 hatası burada yakalanır
          this.message.error('Giriş başarısız! E-posta veya şifre hatalı.');
        }
      });
    } else {
      // Hataları kullanıcıya göster
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}