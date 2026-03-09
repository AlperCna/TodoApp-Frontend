import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  providers: [NzMessageService],
  /* ChangeDetectionStrategy.OnPush: Bileşenin gereksiz render döngülerine girmesini
     engeller. Sadece girdi değişimlerinde veya manuel işaretleme yapıldığında 
     arayüzü güncelleyerek performans optimizasyonu sağlar.
  */
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Register implements OnInit {
  validateForm: UntypedFormGroup;
  loading = false;
  tenants: string[] = [];

  constructor(
    private fb: UntypedFormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef // Mekanik kontrol için servis enjeksiyonu
  ) {
    this.validateForm = this.fb.group({
      tenantName: [null, [Validators.required, Validators.minLength(2)]],
      username: [null, [Validators.required, Validators.minLength(3)]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      confirmPassword: [null, [Validators.required, this.confirmationValidator]]
    });
  }

  ngOnInit(): void {
    this.fetchTenants();
  }

  /**
   * Şirket listesini asenkron olarak getirir. Liste güncellendiğinde 
   * OnPush stratejisi gereği manuel işaretleme yapılır.
   */
  fetchTenants(): void {
    this.auth.getTenants().subscribe({
      next: (list) => {
        this.tenants = list;
        /* Veri akışı tamamlandığında arayüzün güncellenmesi tetiklenir. */
        this.cdr.markForCheck();
      },
      error: () => console.error('Şirket listesi alınamadı.')
    });
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { shredded: true };
    } else if (control.value !== this.validateForm.controls['password'].value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  updateConfirmValidator(): void {
    Promise.resolve().then(() => this.validateForm.controls['confirmPassword'].updateValueAndValidity());
  }

  /**
   * Kayıt operasyonu asenkron bir süreçtir. İşlem adımlarındaki 
   * durum değişiklikleri manuel olarak işaretlenerek performans korunur.
   */
  onRegister(): void {
    if (this.validateForm.valid) {
      this.loading = true;
      /* İstek öncesi loading durumunun yansıması için işaretleme yapılır. */
      this.cdr.markForCheck();
      
      const registerPayload: IRegisterRequest = this.validateForm.value;
      
      this.auth.register(registerPayload).subscribe({
        next: () => {
          this.message.success('Kayıt başarılı! Hoş geldiniz.');
          this.router.navigate(['/login']);
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.message.error('Kayıt başarısız. Bilgileri kontrol edin.');
          this.loading = false;
          /* Hata durumunda loading ikonunun kapanması sağlanır. */
          this.cdr.markForCheck();
        }
      });
    } else {
      /* Form validasyon hatalarının tetiklenmesi ve arayüzde görünmesi sağlanır. */
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