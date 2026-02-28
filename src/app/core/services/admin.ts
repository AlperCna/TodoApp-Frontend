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

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  // ✅ GÜNCELLENDİ: Artık Admin de sayfalı ve aramalı veri alıyor
  getTodos(pageNumber: number = 1, pageSize: number = 10, search: string = ''): Observable<any> {
    let url = `${this.apiUrl}/todos?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    // Geriye any[] değil, PaginatedResult objesi dönüyor
    return this.http.get<any>(url);
  }
}