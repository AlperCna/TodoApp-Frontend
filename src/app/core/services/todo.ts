import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Modellerimizi içeri alıyoruz
import { ITodo } from '../models/todo.model';
import { IPaginatedResult } from '../models/paginated-result.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private apiUrl = `${environment.apiUrl}/Todo`;

  constructor(private http: HttpClient) { }

  //  any yerine IPaginatedResult<ITodo>
  getTodos(pageNumber: number = 1, pageSize: number = 10, search: string = ''): Observable<IPaginatedResult<ITodo>> { 
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }
    
    // HTTP Get isteğini mühürledik
    return this.http.get<IPaginatedResult<ITodo>>(this.apiUrl, { params }); 
  }

  //  todo: any yerine todo: ITodo
  // "Yeni görev eklerken ITodo iskeletine uymak zorundasın."
  createTodo(todo: ITodo): Observable<ITodo> { 
    return this.http.post<ITodo>(this.apiUrl, todo); 
  }
  
  //  id ve todo tiplerini mühürledik
  updateTodo(id: string, todo: ITodo): Observable<ITodo> { 
    return this.http.put<ITodo>(`${this.apiUrl}/${id}`, todo); 
  }

  //  Silme işlemi sonucu genellikle void veya mesaj döner
  deleteTodo(id: string): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/${id}`); 
  }

  // Durum değiştirme sonucu güncel ITodo döner
  toggleComplete(id: string): Observable<ITodo> {
    return this.http.patch<ITodo>(`${this.apiUrl}/${id}/toggle`, {});
  }
}