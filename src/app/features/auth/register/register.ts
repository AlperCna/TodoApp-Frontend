import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

// ✅ NG-ZORRO Bileşenleri
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon'; // 👈 EKSİK OLAN BUYDU

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
    NzIconModule // 👈 BURAYA DA EKLEDİK
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
  providers: [NzMessageService]
})
export class Register {
  validateForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private message: NzMessageService
  ) {
    this.validateForm = this.fb.group({
      username: [null, [Validators.required, Validators.minLength(3)]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      confirmPassword: [null, [Validators.required, this.confirmationValidator]]
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
      const payload = {
        username: this.validateForm.value.username,
        email: this.validateForm.value.email,
        password: this.validateForm.value.password
      };

      this.auth.register(payload).subscribe({
        next: () => {
          this.message.success('Kayıt başarılı! Giriş yapabilirsiniz.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          this.message.error('Kayıt başarısız. Bilgileri kontrol edin.');
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