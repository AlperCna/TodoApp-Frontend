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
  loading = false; // ✅ Buton animasyonu için eklendi

  constructor(
    private fb: UntypedFormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private message: NzMessageService
  ) {
    this.validateForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]]
    });
  }

  onLogin(): void {
    if (this.validateForm.valid) {
      this.loading = true; // İşlem başladı
      
      this.auth.login(this.validateForm.value).subscribe({
        next: (response) => {
          this.message.success('Giriş başarılı! Hoş geldiniz.');
          this.loading = false;
          // AuthService içindeki yönlendirme mantığı (isAdmin vb.) çalışacaktır
        },
        error: (err) => {
          this.loading = false;
          this.message.error('Giriş başarısız! Bilgilerinizi kontrol edin.');
        }
      });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}