import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private apiUrl = `${environment.apiUrl}/Todo`;

  constructor(private http: HttpClient) { }

  // ✅ İSİM GÜNCELLEMESİ: Backend'deki GetTodosAsync ile uyumlu hale getirildi
  getTodos(pageNumber: number = 1, pageSize: number = 10, search: string = ''): Observable<any> { 
    // Parametreleri HttpParams ile yönetmek daha güvenlidir
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get<any>(this.apiUrl, { params }); 
  }

  createTodo(todo: any) { return this.http.post(this.apiUrl, todo); }
  
  updateTodo(id: any, todo: any) { 
    return this.http.put(`${this.apiUrl}/${id}`, todo); 
  }

  deleteTodo(id: string) { return this.http.delete(`${this.apiUrl}/${id}`); }

  // EKSİK METOT EKLENDİ: Backend'deki HttpPatch("{id}/toggle") için
  toggleComplete(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle`, {});
  }
}