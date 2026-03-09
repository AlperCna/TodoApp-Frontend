import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  providers: [NzMessageService],
  /* ChangeDetectionStrategy.OnPush: Form tabanlı bileşenlerde gereksiz değişim 
     algılama döngülerini önlemek ve performansı optimize etmek için tercih edilmiştir. 
  */
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  validateForm: UntypedFormGroup;
  loading = false;

  constructor(
    private fb: UntypedFormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef // Mekanik kontrol için servis enjeksiyonu
  ) {
    this.validateForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]]
    });
  }

  /**
   * Kurumsal Giriş (SSO) Yönlendirme Metodu.
   * Dış servis yönlendirmesi olduğu için uygulama içi render takibi gerekmez.
   */
  loginWithSSO(provider: string): void {
    window.location.href = `https://localhost:7244/api/auth/login-${provider}`;
  }

  /**
   * Giriş denemesi asenkron bir süreçtir. OnPush stratejisi nedeniyle 
   * 'loading' durumu değişimleri manuel olarak işaretlenmelidir.
   */
  onLogin(): void {
    if (this.validateForm.valid) {
      this.loading = true;
      /* Asenkron istek öncesi 'loading' spinner'ın arayüzde 
         görülebilmesi için manuel tetikleme yapılır. 
      */
      this.cdr.markForCheck();
      
      const loginPayload: ILoginRequest = this.validateForm.value;
      
      this.auth.login(loginPayload).subscribe({
        next: (response: IAuthResponse) => {
          this.message.success('Giriş başarılı! Hoş geldiniz.');
          this.loading = false;
          /* Başarılı dönüş sonrası UI durumunun güncellenmesi sağlanır. */
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.loading = false;
          this.message.error('Giriş başarısız! Bilgilerinizi kontrol edin.');
          /* Hata durumunda loading ikonunun kapanması için işaretleme yapılır. */
          this.cdr.markForCheck();
        }
      });
    } else {
      /* Form doğrulama hatalarının (validasyon) arayüzde anında 
         görünebilmesi için döngü sonunda manuel işaretleme yapılır. 
      */
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.cdr.markForCheck();
    }
  }
}