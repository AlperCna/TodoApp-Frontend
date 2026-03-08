import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { IUser } from '../models/user.model';
import { ITodo } from '../models/todo.model';
import { IPaginatedResult } from '../models/paginated-result.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/Admin`;

  constructor(private http: HttpClient) {}

 
  // "Bana rastgele bir dizi değil, IUser iskeletine uygun bir dizi getir."
  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${this.apiUrl}/users`);
  }

  
  // "Bu kol bana içinde ITodo listesi ve toplam sayı olan mühürlü bir paket getirecek."
  getTodos(pageNumber: number = 1, pageSize: number = 10, search: string = ''): Observable<IPaginatedResult<ITodo>> {
    let url = `${this.apiUrl}/todos?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    // HTTP GET isteğine de tipi (Generic) ekliyoruz ki TypeScript veriyi tanısın
    return this.http.get<IPaginatedResult<ITodo>>(url);
  }
}