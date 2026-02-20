import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../../core/services/todo';
import { Subject, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth';

// ✅ NG-ZORRO Modülleri
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NzInputModule, NzButtonModule, 
    NzCheckboxModule, NzListModule, NzCardModule, NzDatePickerModule, 
    NzIconModule, NzPaginationModule, NzEmptyModule, NzTagModule, NzGridModule
  ],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css',
  providers: [NzMessageService]
})
export class TodoList implements OnInit, OnDestroy {
  todos: any[] = [];
  newTodoTitle = '';
  newTodoDescription = '';
  newTodoDueDate: Date | null = null;

  currentPage = 1;
  pageSize = 5;
  totalCount = 0;
  searchTerm = '';

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(
    private todoService: TodoService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.loadTodos();

    // ✅ RxJS Arama Mantığı (Aynen Korundu)
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadTodos();
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.searchSubject.next(this.searchTerm);
  }

  loadTodos() {
    this.todoService.getTodos(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (res: any) => {
        this.todos = res.items || [];
        this.totalCount = res.totalCount || 0;
        this.cdr.detectChanges();
      },
      error: () => this.message.error('Veriler yüklenirken bir hata oluştu!')
    });
  }

  addTodo() {
    if (!this.newTodoTitle.trim()) {
      this.message.warning('Lütfen bir görev başlığı girin!');
      return;
    }

    const payload = {
      title: this.newTodoTitle,
      description: this.newTodoDescription,
      dueDate: this.newTodoDueDate,
      isCompleted: false
    };

    this.todoService.createTodo(payload).subscribe({
      next: () => {
        this.message.success('Görev başarıyla eklendi.');
        this.newTodoTitle = '';
        this.newTodoDescription = '';
        this.newTodoDueDate = null;
        this.loadTodos();
      }
    });
  }

  updateTodo(todo: any) {
    this.todoService.updateTodo(todo.id, todo).subscribe({
      next: () => this.cdr.detectChanges()
    });
  }

  delete(id: string) {
    this.todoService.deleteTodo(id).subscribe(() => {
      this.message.info('Görev silindi.');
      this.loadTodos();
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadTodos();
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }
}