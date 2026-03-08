import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
// TODO Servisi, Todo'larla ilgili tüm API çağrılarını yönetecek
@Injectable({ providedIn: 'root' })
export class TodoService {
  private apiUrl = `${environment.apiUrl}/Todo`;

  constructor(private http: HttpClient) { }

  // TODO'ları sayfalama ve arama destekli çekmek için metod
  getTodos(pageNumber: number = 1, pageSize: number = 10, search: string = ''): Observable<any> { 
    // Parametreleri HttpParams ile yönetmek daha güvenlidir
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
// Arama parametresi varsa ekle
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get<any>(this.apiUrl, { params }); 
  }
// Diğer CRUD metodları
  createTodo(todo: any) { return this.http.post(this.apiUrl, todo); }
  
  updateTodo(id: any, todo: any) { 
    return this.http.put(`${this.apiUrl}/${id}`, todo); 
  }
// Backend'deki HttpDelete("{id}") için metod
  deleteTodo(id: string) { return this.http.delete(`${this.apiUrl}/${id}`); }

  // Backend'deki HttpPatch("{id}/toggle") için metod TODO'nun tamamlanma durumunu değiştirmek için Bu metod, ilgili ID'li TODO'nun tamamlanma durumunu tersine çevirecek bir PATCH isteği gönderir.
  toggleComplete(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle`, {});
  }
}