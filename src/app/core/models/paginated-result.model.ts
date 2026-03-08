// <T> burada 'Jenerik' (Generic) demektir. 
// Bu kutunun içine ister Todo koy, ister User koy; her şeye uyar.
export interface IPaginatedResult<T> {
  items: T[];       // Veri listesi (Hangi tipi verirsek o)
  totalCount: number; // Toplam kayıt sayısı
}