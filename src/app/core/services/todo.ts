import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private apiUrl = `${environment.apiUrl}/Todo`;

  constructor(private http: HttpClient) { }

  // GÜNCELLENDİ: search parametresi eklendi
  getTodos(pageNumber: number = 1, pageSize: number = 10, search: string = ''): Observable<any> { 
    let url = `${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    return this.http.get<any>(url); 
  }

  createTodo(todo: any) { return this.http.post(this.apiUrl, todo); }
  
  updateTodo(id: any, todo: any) { 
    return this.http.put(`${this.apiUrl}/${id}`, todo); 
  }

  deleteTodo(id: string) { return this.http.delete(`${this.apiUrl}/${id}`); }
}