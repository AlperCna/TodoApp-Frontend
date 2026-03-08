import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

// Domain Modellerini içeri alıyoruz
import { ILoginRequest, IAuthResponse } from '../../../core/models/auth.model';

// NG-ZORRO Modülleri
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';

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
    NzIconModule,
    NzDividerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [NzMessageService]
})
export class Login {
  validateForm: UntypedFormGroup;
  loading = false;

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

  /**
   * Kurumsal Giriş (SSO) Yönlendirme Metodu.
   * Mekanik bir yönlendirme olduğu için burada model gerekmez.
   */
  loginWithSSO(provider: string): void {
    window.location.href = `https://localhost:7244/api/auth/login-${provider}`;
  }

  /**
   * Giriş denemesi yapar. 
   * Form verilerini ILoginRequest tipine mühürleyerek servise gönderir.
   */
  onLogin(): void {
    if (this.validateForm.valid) {
      this.loading = true;
      
      // Güncelleme 1: any yerine ILoginRequest kullanımı
      const loginPayload: ILoginRequest = this.validateForm.value;
      
      this.auth.login(loginPayload).subscribe({
        //  Güncelleme 2: response artık any değil, IAuthResponse tipinde
        next: (response: IAuthResponse) => {
          this.message.success('Giriş başarılı! Hoş geldiniz.');
          this.loading = false;
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