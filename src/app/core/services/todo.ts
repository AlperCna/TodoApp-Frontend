import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private apiUrl = `${environment.apiUrl}/Todo`;

  constructor(private http: HttpClient) { }

  getTodos() { return this.http.get<any[]>(this.apiUrl); } // Listeleme
  createTodo(todo: any) { return this.http.post(this.apiUrl, todo); } // Ekleme
 updateTodo(id: any, todo: any) { 
  // Backend'in id'yi string mi int mi beklediğine göre id.toString() gerekebilir
  return this.http.put(`${this.apiUrl}/${id}`, todo); 
}
  deleteTodo(id: string) { return this.http.delete(`${this.apiUrl}/${id}`); } // Silme
}