import { Component, OnInit } from '@angular/core';
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
    NzButtonModule
  ],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css'
})
export class AdminPage implements OnInit {
  users: any[] = [];
  allTodos: any[] = [];
  loading = true;

  constructor(
    private auth: AuthService, 
    private admin: AdminService
  ) {}

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData() {
    this.loading = true;
    // Kullanıcıları getir
    this.admin.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      }
    });

    // Todoları getir
    this.admin.getTodos().subscribe({
      next: (data) => {
        this.allTodos = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  logout() {
    this.auth.logout();
  }
}