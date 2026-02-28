import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Arama kutusu için gerekebilir
import { AuthService } from '../../core/services/auth';
import { AdminService } from '../../core/services/admin';

// ✅ NG-ZORRO Bileşenleri
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
import { NzInputModule } from 'ng-zorro-antd/input'; // ✅ Arama için eklendi

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzTagModule,
    NzIconModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzButtonModule,
    NzTypographyModule,
    NzInputModule
  ],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css'
})
export class AdminPage implements OnInit {
  users: any[] = [];
  allTodos: any[] = [];
  loading = true;
  currentTenantId: string | null = '';

  // 📄 SAYFALAMA VE ARAMA DEĞİŞKENLERİ
  pageIndex = 1;
  pageSize = 10;
  totalCount = 0;
  searchText = '';

  constructor(
    private auth: AuthService, 
    private admin: AdminService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.currentTenantId = this.auth.getTenantId();
    this.refreshData();
  }

  // ✅ MERKEZİ VERİ ÇEKME METODU
  refreshData() {
    this.loading = true;

    // 👥 Kullanıcı verilerini çekiyoruz (Sabit Liste)
    this.admin.getUsers().subscribe({
      next: (data) => {
        setTimeout(() => {
          this.users = data;
          this.cdr.markForCheck();
        });
      }
    });

    // 📝 GÖREV VERİLERİNİ ÇEKİYORUZ (Sayfalı ve Aramalı)
    // Backend'deki GetTodosAsync metoduna parametreleri gönderiyoruz
    this.admin.getTodos(this.pageIndex, this.pageSize, this.searchText).subscribe({
      next: (res) => { 
        // 🔑 HATA ÇÖZÜMÜ: res artık direkt dizi değil, bir obje.
        // İçindeki 'items' (liste) ve 'totalCount' (toplam sayı) değerlerini alıyoruz.
        setTimeout(() => {
          this.allTodos = res.items; // Tabloya basılacak dizi
          this.totalCount = res.totalCount; // Toplam kayıt sayısı (Sayfalama için)
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        console.error("Veri çekme hatası:", err);
        setTimeout(() => {
          this.loading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  // 🔄 Tabloda sayfa değiştiğinde tetiklenen metot
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.refreshData();
  }

  // 🔍 Arama yapıldığında tetiklenen metot
  onSearch(): void {
    this.pageIndex = 1; // Arama yapınca 1. sayfaya dön
    this.refreshData();
  }

  logout() {
    this.auth.logout();
  }
}