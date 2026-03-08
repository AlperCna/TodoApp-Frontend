import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
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
  styleUrl: './admin-page.css'
})
export class AdminPage implements OnInit {
  // --- Değişken Güncellemeleri ---
  
  // any[] yerine IUser[]: Kullanıcı listesini mühürledik
  users: IUser[] = [];
  
  // any[] yerine ITodo[]: Görev listesini mühürledik
  allTodos: ITodo[] = [];
  
  loading = true;
  currentTenantId: string | null = '';

  // SAYFALAMA VE ARAMA DEĞİŞKENLERİ
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
   * Verileri çekmek için merkezi metot. 
   * Servislerden gelen veriler artık mühürlü modellerle geliyor.
   */
  refreshData(): void {
    this.loading = true;

    // KULLANICI VERİLERİ (AdminService.getUsers artık IUser[] döner)
    this.admin.getUsers().subscribe({
      next: (data: IUser[]) => {
        setTimeout(() => {
          this.users = data;
         
          this.cdr.markForCheck();
        });
      }
    });

    // GÖREV VERİLERİ (AdminService.getTodos artık IPaginatedResult<ITodo> döner)
    this.admin.getTodos(this.pageIndex, this.pageSize, this.searchText).subscribe({
      next: (res) => { 
        setTimeout(() => {
          // res artık IPaginatedResult tipinde olduğu için .items ve .totalCount'a erişim güvenli
          this.allTodos = res.items; 
          this.totalCount = res.totalCount; 
          
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

  /**
   * Tabloda sayfa değiştiğinde tetiklenir, yeni sayfadaki veriyi asenkron olarak ister.
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.refreshData();
  }

  /**
   * Arama terimine göre sayfayı 1'e çeker ve asenkron kuryeyi yeni terimle yola çıkarır.
   */
  onSearch(): void {
    this.pageIndex = 1; 
    this.refreshData();
  }

  /**
   * Oturumu güvenli bir şekilde kapatır.
   */
  logout(): void {
    this.auth.logout();
  }
}