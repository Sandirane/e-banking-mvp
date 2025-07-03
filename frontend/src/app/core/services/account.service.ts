import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@config/environment';
import { Account } from '@core/models/account';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/accounts`;

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.apiUrl);
  } 

  getAccount(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/${id}`);
  }
 
  createAccount(payload: { balance?: number; currency?: string }): Observable<Account> {
    return this.http.post<Account>(this.apiUrl, payload);
  }
 
  updateAccount(id: number, updates: { currency: string }): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/${id}`, updates);
  }
 
  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
}
