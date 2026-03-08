export interface ITodo {
  id: string;
  title: string;
  description?: string; // Soru işareti: Bu alan boş gelebilir (optional)
  isCompleted: boolean;
  dueDate?: Date;
  tenantId: string;
}