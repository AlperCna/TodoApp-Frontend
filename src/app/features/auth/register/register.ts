import { Component, OnInit } from '@angular/core'; //  OnInit eklendi
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

// NG-ZORRO Modülleri
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete'; //  Seçim listesi için kritik

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
    NzAutocompleteModule //  Listeyi göstermek için ekledik
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
  providers: [NzMessageService]
})
export class Register implements OnInit { // OnInit uygulandı
  validateForm: UntypedFormGroup;
  loading = false;
  tenants: string[] = []; // Mevcut şirketlerin listesi

  constructor(
    private fb: UntypedFormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private message: NzMessageService
  ) {
    this.validateForm = this.fb.group({
      // : Hem seçilebilir hem yazılabilir şirket alanı
      tenantName: [null, [Validators.required, Validators.minLength(2)]],
      username: [null, [Validators.required, Validators.minLength(3)]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      confirmPassword: [null, [Validators.required, this.confirmationValidator]]
    });
  }

  ngOnInit(): void {
    this.fetchTenants(); // Sayfa açılınca şirketleri getir
  }

  fetchTenants(): void {
    this.auth.getTenants().subscribe({
      next: (list) => this.tenants = list,
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

  onRegister(): void {
    if (this.validateForm.valid) {
      this.loading = true;
      // Backend'deki yeni RegisterRequest DTO'su ile tam uyumlu payload
      this.auth.register(this.validateForm.value).subscribe({
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
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}