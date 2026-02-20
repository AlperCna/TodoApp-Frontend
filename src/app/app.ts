import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
// ✅ Zorro Modüll
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NzLayoutModule, NzMenuModule, NzIconModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App { 
  isAuthPage = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // URL login veya register içeriyorsa isAuthPage true olur
      this.isAuthPage = this.router.url.includes('login') || this.router.url.includes('register');
    });
  }
}