import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // ChangeDetectorRef eklendi
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../../core/services/todo';
import { Router } from '@angular/router';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css'
})
export class TodoList implements OnInit {
  todos: any[] = [];
  newTodoTitle = '';
  newTodoDescription = '';
  newTodoDueDate = '';

  // constructor içine cdr: ChangeDetectorRef ekliyoruz
  constructor(
    private todoService: TodoService, 
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() { 
    this.loadTodos(); 
  }

  loadTodos() { 
    this.todoService.getTodos().subscribe({
      next: (res: any) => {
        // Gelen veriyi atıyoruz
        this.todos = Array.isArray(res) ? res : (res.data || []);
        
        // EKRANI ZORLA TAZELİYORUZ
        this.cdr.detectChanges(); 
        console.log('Liste güncellendi:', this.todos);
      },
      error: (err) => console.error('Hata:', err)
    });
  }

  addTodo() {
    if (!this.newTodoTitle.trim()) return;

    const payload = {
      title: this.newTodoTitle,
      description: this.newTodoDescription,
      dueDate: this.newTodoDueDate || null,
      isCompleted: false
    };

    // Giriş kutularını ANINDA temizliyoruz
    this.newTodoTitle = '';
    this.newTodoDescription = '';
    this.newTodoDueDate = '';

    this.todoService.createTodo(payload).subscribe({
      next: () => {
        this.loadTodos(); // Yeni listeyi hemen çek
      },
      error: (err) => {
        alert("Ekleme başarısız!");
        this.loadTodos(); // Hata olsa da listeyi tazele
      }
    });
  }

  updateTodo(todo: any) {
    this.todoService.updateTodo(todo.id, todo).subscribe({
      next: () => {
        this.cdr.detectChanges(); // Checkbox'a basınca anında çizgiyi çek
      },
      error: () => this.loadTodos()
    });
  }

  delete(id: string) {
    this.todoService.deleteTodo(id).subscribe(() => this.loadTodos());
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}