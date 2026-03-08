import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

// Veri güvenliği ve tip tutarlılığı için kayıt modelimizi içeri aktarıyoruz
import { IRegisterRequest } from '../../../core/models/auth.model';

// NG-ZORRO Bileşenleri
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';

@Component({
  selector: 'app-register',
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
    NzGridModule,
    NzAutocompleteModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
  providers: [NzMessageService]
})
export class Register implements OnInit {
  // Form yapısını ve yükleme durumunu yönetecek değişkenler
  validateForm: UntypedFormGroup;
  loading = false;
  
  // Backend'den çekilecek mevcut şirketlerin (Tenant) listesi
  tenants: string[] = [];

  constructor(
    private fb: UntypedFormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private message: NzMessageService
  ) {
    // Form kurallarını ve validasyonları tanımlıyoruz
    this.validateForm = this.fb.group({
      tenantName: [null, [Validators.required, Validators.minLength(2)]],
      username: [null, [Validators.required, Validators.minLength(3)]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      confirmPassword: [null, [Validators.required, this.confirmationValidator]]
    });
  }

  /**
   * Bileşen ilk kez ayağa kalktığında şirket listesini asenkron olarak çeker.
   */
  ngOnInit(): void {
    this.fetchTenants();
  }

  /**
   * AuthService üzerinden mevcut şirket isimlerini getirir.
   */
  fetchTenants(): void {
    this.auth.getTenants().subscribe({
      next: (list) => this.tenants = list,
      error: () => console.error('Şirket listesi alınamadı.')
    });
  }

  /**
   * Girilen iki şifrenin birbiriyle eşleşip eşleşmediğini kontrol eden özel denetleyici.
   */
  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { shredded: true };
    } else if (control.value !== this.validateForm.controls['password'].value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  /**
   * Şifre her değiştiğinde doğrulama alanını mekanik olarak tetikleyen yardımcı metot.
   */
  updateConfirmValidator(): void {
    Promise.resolve().then(() => this.validateForm.controls['confirmPassword'].updateValueAndValidity());
  }

  /**
   * Kayıt işlemini başlatan ana metot. 
   * Form verilerini IRegisterRequest modeline dönüştürerek servise iletir.
   */
  onRegister(): void {
    if (this.validateForm.valid) {
      this.loading = true;
      
      // any yerine IRegisterRequest modelini kullanarak tip güvenliğini sağlıyoruz
      const registerPayload: IRegisterRequest = this.validateForm.value;
      
      this.auth.register(registerPayload).subscribe({
        next: () => {
          this.message.success('Kayıt başarılı! Hoş geldiniz.');
          this.router.navigate(['/login']);
          this.loading = false;
        },
        error: (err) => {
          this.message.error('Kayıt başarısız. Bilgileri kontrol edin.');
          this.loading = false;
        }
      });
    } else {
      // Form geçersizse tüm alanları "kirli" (dirty) olarak işaretleyip hataları gösteririz
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}