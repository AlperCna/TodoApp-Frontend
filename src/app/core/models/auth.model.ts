// 1. Giriş/Kayıt sonrası sunucudan gelen bilet (Token) paketi
export interface IAuthResponse {
  token: string;
  refreshToken: string;
}

// 2. Giriş yaparken gönderdiğimiz paket
export interface ILoginRequest {
  email: string;
  password?: string;
}

// 3. Kayıt olurken gönderdiğimiz paket
export interface IRegisterRequest {
  tenantName: string;
  username: string;
  email: string;
  password?: string;
}