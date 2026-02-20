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
    // Backend'den direkt dizi geldiği için any[] olarak işaretledik
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getTodos(): Observable<any[]> {
    // image_c98f06'da gördüğümüz üzere todolar da dizi olarak geliyor
    return this.http.get<any[]>(`${this.apiUrl}/todos`);
  }
}