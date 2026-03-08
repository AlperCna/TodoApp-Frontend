import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../../core/services/todo';
import { Subject, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth';

// Tip güvenliği için modellerimizi içeri alıyoruz
import { ITodo } from '../../../core/models/todo.model';
import { IPaginatedResult } from '../../../core/models/paginated-result.model';

// NG-ZORRO Modülleri
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
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NzInputModule, NzButtonModule, 
    NzCheckboxModule, NzListModule, NzCardModule, NzDatePickerModule, 
    NzIconModule, NzPaginationModule, NzEmptyModule, NzTagModule, NzGridModule, NzProgressModule, NzStatisticModule
  ],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css',
  providers: [NzMessageService]
})
export class TodoList implements OnInit, OnDestroy {
  // any[] yerine ITodo[]: Listenin her elemanı artık bir görev objesidir
  todos: ITodo[] = [];
  
  newTodoTitle = '';
  newTodoDescription = '';
  newTodoDueDate: Date | null = null;

  currentPage = 1;
  pageSize = 5;
  totalCount = 0;
  searchTerm = '';

  // RxJS ile asenkron arama yönetimi için Subject yapısı
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(
    private todoService: TodoService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private message: NzMessageService
  ) {}

  /**
   * Bileşen başlatıldığında ilk verileri çeker ve arama akışını (Stream) dinlemeye başlar.
   */
  ngOnInit(): void {
    this.loadTodos();

    // Arama trafiğini debounceTime ile dizginleyen asenkron mekanizma
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadTodos();
    });
  }

  /**
   * Kullanıcı her harf yazdığında arama akışına yeni bir sinyal gönderir.
   */
  onSearch(): void {
    this.currentPage = 1;
    this.searchSubject.next(this.searchTerm);
  }

  /**
   * TodoService üzerinden verileri asenkron olarak çeker.
   * Gelen yanıt artık IPaginatedResult<ITodo> tipindedir.
   */
  loadTodos(): void {
    this.todoService.getTodos(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (res: IPaginatedResult<ITodo>) => {
        // Mikro-task kullanarak UI güncellemesini garantiye alıyoruz
        Promise.resolve().then(() => {
          this.todos = res.items || [];
          this.totalCount = res.totalCount || 0;
          this.cdr.markForCheck(); 
        });
      },
      error: () => this.message.error('Veriler yüklenirken bir hata oluştu!')
    });
  }

  /**
   * Yeni bir görev oluşturur. Payload yapısı ITodo iskeletine uygun olmalıdır.
   */
  addTodo(): void {
    if (!this.newTodoTitle.trim()) {
      this.message.warning('Lütfen bir görev başlığı girin!');
      return;
    }

    // Gönderilecek veri paketini ITodo tipinde hazırlıyoruz (Partial çünkü id backend'de oluşacak)
    const payload: Partial<ITodo> = {
      title: this.newTodoTitle,
      description: this.newTodoDescription,
      dueDate: this.newTodoDueDate || undefined,
      isCompleted: false
    };

    this.todoService.createTodo(payload as ITodo).subscribe({
      next: () => {
        this.message.success('Görev başarıyla eklendi.');
        
        // Formu temizle ve listeyi tazele
        setTimeout(() => {
          this.newTodoTitle = '';
          this.newTodoDescription = '';
          this.newTodoDueDate = null;
          
          this.loadTodos();
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  /**
   * Mevcut bir görevi günceller.
   */
  updateTodo(todo: ITodo): void {
    this.todoService.updateTodo(todo.id, todo).subscribe({
      next: () => {
        this.cdr.detectChanges();
        this.message.success('Görev güncellendi.');
      },
      error: () => this.loadTodos()
    });
  }

  /**
   * Belirtilen id'ye sahip görevi siler.
   */
  delete(id: string): void {
    this.todoService.deleteTodo(id).subscribe(() => {
      this.message.info('Görev silindi.');
      this.loadTodos();
    });
  }

  /**
   * Sayfa değiştiğinde listeyi yeni parametrelerle tekrar yükler.
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTodos();
  }

  /**
   * Kullanıcı oturumunu güvenli bir şekilde kapatır.
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Bellek sızıntısını önlemek için asenkron aboneliği sonlandırır.
   */
  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  /**
   * Tamamlanma yüzdesini ITodo modelleri üzerinden hesaplar.
   */
  getPercent(): number {
    if (this.todos.length === 0) return 0;
    const completed = this.todos.filter(t => t.isCompleted).length;
    return Math.round((completed / this.todos.length) * 100);
  }

  /**
   * Bekleyen (isCompleted: false) görevlerin sayısını döner.
   */
  getPendingCount(): number {
    return this.todos.filter(t => !t.isCompleted).length;
  }

  /**
   * Tamamlanan (isCompleted: true) görevlerin sayısını döner.
   */
  getCompletedCount(): number {
    return this.todos.filter(t => t.isCompleted).length;
  }
}