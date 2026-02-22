import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // ✅ ChangeDetectorRef eklendi
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { AdminService } from '../../core/services/admin';

// ✅ NG-ZORRO Dashboard Bileşenleri
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzTagModule,
    NzIconModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzButtonModule,
    NzTypographyModule
  ],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css'
})
export class AdminPage implements OnInit {
  users: any[] = [];
  allTodos: any[] = [];
  loading = true;
  currentTenantId: string | null = '';

  constructor(
    private auth: AuthService, 
    private admin: AdminService,
    private cdr: ChangeDetectorRef // ✅ Hatalı olan 'cdr' özelliği buraya enjekte edilerek çözüldü
  ) {}

  ngOnInit(): void {
    // ✅ Token içinden Tenant ID'yi alıp değişkene atıyoruz
    this.currentTenantId = this.auth.getTenantId();
    this.refreshData();
  }

  // ✅ Verileri yenilemek için kullanılan, NG0100 hatasını önleyen metot
  refreshData() {
    this.loading = true;

    // 👥 Kullanıcı verilerini çekiyoruz
    this.admin.getUsers().subscribe({
      next: (data) => {
        // ✅ State güncellemesini setTimeout ile bir sonraki "tick"e atarak 
        // "ExpressionChangedAfterItHasBeenCheckedError" hatasını engelliyoruz
        setTimeout(() => {
          this.users = data;
          this.cdr.markForCheck(); // Değişiklikleri Angular'a bildiriyoruz
        });
      }
    });

    // 📝 Görev verilerini çekiyoruz
    this.admin.getTodos().subscribe({
      next: (data) => {
        setTimeout(() => {
          this.allTodos = data;
          this.loading = false; // İşlem bitti
          this.cdr.markForCheck();
        });
      },
      error: () => {
        setTimeout(() => {
          this.loading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}