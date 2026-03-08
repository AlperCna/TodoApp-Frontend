export interface IUser {
  id: string;        // Kullanıcının benzersiz kimliği
  userName: string;  // Kullanıcı adı
  email: string;     // E-posta adresi
  role: string;      // 'Admin' veya 'User' (Rol mekanizması için kritik)
}