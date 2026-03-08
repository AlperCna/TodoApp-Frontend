import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/Admin`;

  constructor(private http: HttpClient) {}
// Kullanıcı listesini çekmek için metod
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  // TODO'ları sayfalama ve arama destekli çekmek için metod
  getTodos(pageNumber: number = 1, pageSize: number = 10, search: string = ''): Observable<any> {
    let url = `${this.apiUrl}/todos?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    // Backend'deki GetTodosAsync metoduna parametreleri gönderiyoruz
    return this.http.get<any>(url);
  }
}