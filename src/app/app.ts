import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

// ✅ NG-ZORRO Modülleri
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule, 
    NzLayoutModule, 
    NzMenuModule, 
    NzIconModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App { 
  isAuthPage = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Login/Register sayfalarında sidebar'ı gizlemek için kontrol
      this.isAuthPage = this.router.url.includes('login') || this.router.url.includes('register');
    });
  }
}