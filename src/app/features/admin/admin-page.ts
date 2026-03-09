import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../core/services/auth';
import { AdminService } from '../../core/services/admin';

// Modellerimizi (Domain Objelerini) içeri alıyoruz
import { IUser } from '../../core/models/user.model';
import { ITodo } from '../../core/models/todo.model';

// NG-ZORRO Bileşenleri
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
import { NzInputModule } from 'ng-zorro-antd/input';

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
  styleUrl: './admin-page.css',
  /* ChangeDetectionStrategy.OnPush seçilerek performans odaklı bir desen belirlenmiştir.
     Bu strateji, bileşenin sadece girdi (Input) değiştiğinde veya manuel tetikleme 
     yapıldığında kontrol edilmesini sağlayarak gereksiz render maliyetini önler.
  */
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPage implements OnInit {
  
  users: IUser[] = [];
  allTodos: ITodo[] = [];
  loading = true;
  currentTenantId: string | null = '';

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

  /**
   * Merkezi veri yenileme metodu. Asenkron operasyonlar OnPush stratejisi ile 
   * yönetildiği için her başarılı veri dönüşünde manuel tetikleme yapılması gerekir.
   */
  refreshData(): void {
    this.loading = true;
    /* OnPush stratejisinde loading durumu değişikliğinin arayüze anında yansıması 
       için asenkron işlem öncesi manuel kontrol tetiklenir.
    */
    this.cdr.markForCheck();

    // Kullanıcı verilerinin asenkron olarak talep edilmesi
    this.admin.getUsers().subscribe({
      next: (data: IUser[]) => {
        this.users = data;
        /* Asenkron API cevabı Zone.js dışı bir tetikleme içerebileceğinden 
           veya OnPush kısıtlamalarından dolayı markForCheck kullanımı zorunludur.
        */
        this.cdr.markForCheck();
      }
    });

    // Görev verilerinin asenkron olarak talep edilmesi
    this.admin.getTodos(this.pageIndex, this.pageSize, this.searchText).subscribe({
      next: (res) => { 
        this.allTodos = res.items; 
        this.totalCount = res.totalCount; 
        this.loading = false;
        /* Veri kümesi güncellendiğinde Angular'a ilgili ağaç parçasını 
           yeniden kontrol etmesi talimatı verilir.
        */
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("Veri çekme hatası:", err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.refreshData();
  }

  onSearch(): void {
    this.pageIndex = 1; 
    this.refreshData();
  }

  logout(): void {
    this.auth.logout();
  }
}